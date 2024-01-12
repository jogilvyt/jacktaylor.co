import { readFileSync, readdirSync, statSync } from 'fs'
import { hashElement } from 'folder-hash'
import { bundleMDX } from 'mdx-bundler'
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
			// delete all posts, post meta and categories before refreshing cache
			await tx.category.deleteMany({})
			await tx.postMeta.deleteMany({})
			await tx.post.deleteMany({})

			for (const mdxPage of mdxPages) {
				const source = readFileSync(mdxPage, 'utf8')
				const { frontmatter } = await bundleMDX({
					source,
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

				const {
					slug,
					title,
					date,
					description,
					imageUrl,
					imageCredit,
					imageAlt,
				} = parsedFrontmatter.data

				await tx.post.upsert({
					where: { slug },
					create: {
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
									connectOrCreate: parsedFrontmatter.data.categories.map(
										category => ({
											where: { name: category },
											create: { name: category },
										}),
									),
								},
							},
						},
					},
					update: {
						slug,
						content: source,
						postMeta: {
							update: {
								slug,
								title,
								date,
								description,
								imageUrl,
								imageCredit,
								imageAlt,
								categories: {
									connectOrCreate: parsedFrontmatter.data.categories.map(
										category => ({
											where: { name: category },
											create: { name: category },
										}),
									),
								},
							},
						},
					},
					select: { id: true },
				})

				// for (const category of parsedFrontmatter.data.categories) {
				// 	await tx.category.upsert({
				// 		where: { name: category },
				// 		create: { name: category, posts: { connect: { id: post.id } } },
				// 		update: { posts: { connect: { id: post.id } } },
				// 		select: { id: true },
				// 	})
				// }
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
