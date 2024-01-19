import { Blob } from 'buffer'
import { readFileSync, readdirSync, statSync } from 'fs'
import path from 'path'
import { getPixels } from '@unpic/pixels'
import { blurhashToDataUri } from '@unpic/placeholder'
import { encode } from 'blurhash'
import { hashElement } from 'folder-hash'
import { bundleMDX } from 'mdx-bundler'
import mime from 'mime'
import { z } from 'zod'
import { prisma } from './db.server'

const frontmatterSchema = z.object({
	slug: z.string(),
	title: z.string(),
	date: z.date(),
	description: z.string(),
	categories: z.array(z.string()),
	imageAlt: z.string(),
	imageUrl: z.string(),
	imageCredit: z.string(),
})

export async function generateContentCache() {
	const files = getFiles(process.cwd() + '/content')
	const mdxPages = files.filter(file => file.endsWith('.mdx'))

	try {
		const newHash = await prisma.$transaction(async tx => {
			// delete all posts, post meta, post images and categories before refreshing cache
			await tx.category.deleteMany({})
			await tx.postImage.deleteMany({})
			await tx.postMeta.deleteMany({})
			await tx.post.deleteMany({})

			for (const mdxPage of mdxPages) {
				const source = readFileSync(mdxPage, 'utf8')
				const {
					slug,
					title,
					categories,
					date,
					description,
					imageUrl,
					imageCredit,
					imageAlt,
				} = await parseFrontmatter(source)

				const imagePath = path.join(path.dirname(mdxPage), imageUrl)

				const buffer = readFileSync(imagePath)
				const type = mime.getType(imagePath)
				const blob = new Blob([buffer])

				const post = await tx.post.create({
					data: {
						slug,
						content: source,
						postMeta: {
							create: {
								slug,
								title,
								date,
								description,
								imageUrl,
								imageCredit,
								imageAlt,
								categories: {
									connectOrCreate: categories.map(category => ({
										where: { name: category },
										create: { name: category },
									})),
								},
							},
						},
					},
					select: { id: true },
				})

				await tx.postImage.create({
					data: {
						blob: Buffer.from(await blob.arrayBuffer()),
						contentType: type ?? '',
						post: {
							connect: { id: post.id },
						},
					},
				})
			}

			const contentHash = await hashElement(process.cwd() + '/content')
			const dbContentHash = await tx.contentHash.findFirst({
				select: { id: true, hash: true },
			})
			const newHash = tx.contentHash.upsert({
				where: { id: dbContentHash?.id ?? '' },
				create: { hash: contentHash.hash },
				update: { hash: contentHash.hash },
				select: { hash: true },
			})
			return newHash
		})
		await generateBlurHashes(mdxPages)

		return newHash
	} catch (err) {
		console.error('Whoops!', err)
		throw new Error('Content cache generation failed')
	}
}

function getFiles(dir: string, filePaths: string[] = []) {
	const fileList = readdirSync(dir)
	for (const file of fileList) {
		const name = `${dir}/${file}`
		if (statSync(name).isDirectory()) {
			getFiles(name, filePaths)
		} else {
			filePaths.push(name)
		}
	}
	return filePaths
}

async function parseFrontmatter(mdxPage: string) {
	const { frontmatter } = await bundleMDX({
		source: mdxPage,
		cwd: process.cwd(),
	})

	const parsedFrontmatter = frontmatterSchema.safeParse(frontmatter)
	if (!parsedFrontmatter.success) {
		console.error(
			'Invalid frontmatter:',
			parsedFrontmatter.error.flatten().fieldErrors,
		)
		throw new Error('Invalid frontmatter')
	}

	return parsedFrontmatter.data
}

async function generateBlurHashes(mdxPages: string[]) {
	for (const mdxPage of mdxPages) {
		const source = readFileSync(mdxPage, 'utf8')
		const { imageUrl, slug } = await parseFrontmatter(source)
		const imagePath = path.join(path.dirname(mdxPage), imageUrl)
		const buffer = readFileSync(imagePath)
		const imgData = await getPixels(buffer)
		const data = Uint8ClampedArray.from(imgData.data)
		const blurhash = encode(data, imgData.width, imgData.height, 4, 4)
		const dataUri = blurhashToDataUri(blurhash)
		const post = await prisma.post.findFirst({
			where: { slug },
		})
		if (!post?.id) {
			throw new Error('Post not found')
		}
		await prisma.postImage.update({
			where: {
				postId: post.id,
			},
			data: {
				dataUri,
			},
		})
	}
}
