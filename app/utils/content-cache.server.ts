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
	imageAlt: z.string().nullable(),
	imageUrl: z.string(),
	imageCredit: z.string().nullable(),
})

export async function generateContentCache() {
	const files = getFiles(process.cwd() + '/content')
	const mdxPages = files.filter(file => file.endsWith('.mdx'))

	// check which content has changed
	const changedContent = await getDiffs(mdxPages)

	try {
		const newHash = await prisma.$transaction(async tx => {
			// delete any posts that have been deleted from the filesystem
			for (const deletedFiles of changedContent.deleted) {
				await tx.post.delete({
					where: { slug: deletedFiles.slug },
				})
			}

			// update any changed posts
			for (const updatedFiles of changedContent.updated) {
				const { type, blob } = processImage(
					updatedFiles.pagePath,
					updatedFiles.imageUrl,
				)

				await tx.post.update({
					where: { slug: updatedFiles.slug },
					data: {
						content: updatedFiles.content,
						image: {
							update: {
								blob: Buffer.from(await blob.arrayBuffer()),
								contentType: type ?? '',
							},
						},
						postMeta: {
							update: {
								title: updatedFiles.title,
								date: updatedFiles.date,
								description: updatedFiles.description,
								imageUrl: updatedFiles.imageUrl,
								imageCredit: updatedFiles.imageCredit ?? '',
								imageAlt: updatedFiles.imageAlt ?? '',
								categories: {
									connectOrCreate: updatedFiles.categories.map(category => ({
										where: { name: category },
										create: { name: category },
									})),
								},
							},
						},
					},
				})
			}

			// create any new posts
			for (const createdFiles of changedContent.created) {
				const { type, blob } = processImage(
					createdFiles.pagePath,
					createdFiles.imageUrl,
				)

				await tx.post.create({
					data: {
						slug: createdFiles.slug,
						content: createdFiles.content,
						image: {
							create: {
								blob: Buffer.from(await blob.arrayBuffer()),
								contentType: type ?? '',
							},
						},
						postMeta: {
							create: {
								slug: createdFiles.slug,
								title: createdFiles.title,
								date: createdFiles.date,
								description: createdFiles.description,
								imageUrl: createdFiles.imageUrl,
								imageCredit: createdFiles.imageCredit ?? '',
								imageAlt: createdFiles.imageAlt ?? '',
								categories: {
									connectOrCreate: createdFiles.categories.map(category => ({
										where: { name: category },
										create: { name: category },
									})),
								},
							},
						},
					},
				})
			}

			// delete any categories that no longer have any posts
			const categories = await tx.category.findMany({
				select: {
					id: true,
					posts: {
						select: {
							id: true,
						},
					},
				},
			})

			for (const category of categories) {
				if (category.posts.length === 0) {
					await tx.category.delete({
						where: { id: category.id },
					})
				}
			}

			// update the content hash in the DB so we know when to regenerate the cache
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

		// generate blurhashes for any new or updated images
		// this is a SLOW process so we only want to run it on
		// new or updated images
		await generateBlurHashes(changedContent.updatedImages)
		return newHash
	} catch (err) {
		console.error('Whoops!', err)
		throw new Error('Content cache generation failed')
	}
}

// #region Helpers
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

function processImage(pagePath: string, imageUrl: string) {
	const imagePath = path.join(path.dirname(pagePath), imageUrl)
	const buffer = readFileSync(imagePath)
	const type = mime.getType(imagePath)
	const blob = new Blob([buffer])

	return { type, blob }
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
// #endregion

// #region Content diffing
interface DeletedSlug {
	slug: string
}

type UpsertedContent = z.infer<typeof frontmatterSchema> & {
	content: string
	pagePath: string
}

interface ContentDiff {
	deleted: DeletedSlug[]
	updated: UpsertedContent[]
	created: UpsertedContent[]
	updatedImages: string[]
}

/**
 * Takes an array of MDX file paths and returns the differences between the database and the file system
 * @param mdxPages An array of MDX file paths
 * @returns An object containing the differences between the database and the file system
 */
async function getDiffs(mdxPages: string[]): Promise<ContentDiff> {
	// fetch the existing posts from the database
	const dbPosts = await prisma.post.findMany({
		select: {
			slug: true,
			content: true,
			image: {
				select: {
					blob: true,
				},
			},
		},
	})

	// fetch the current posts from the file system
	const mdxPosts = await Promise.all(
		mdxPages.map(async mdxPage => {
			const source = readFileSync(mdxPage, 'utf8')
			const { slug } = await parseFrontmatter(source)
			return {
				slug,
				content: source,
				pagePath: mdxPage,
			}
		}),
	)

	// check if any posts have been deleted (i.e. they exist in the database but not in the file system)
	let deleted: DeletedSlug[] = []

	for (const dbPost of dbPosts) {
		const mdxPost = mdxPosts.find(mdxPost => mdxPost.slug === dbPost.slug)
		if (!mdxPost) {
			deleted.push({ slug: dbPost.slug })
		}
	}

	// check if any posts have been updated (i.e. they exist in both the database and the file system but the content is different)
	const updated: UpsertedContent[] = []

	for (const mdxPost of mdxPosts) {
		const dbPost = dbPosts.find(dbPost => dbPost.slug === mdxPost.slug)
		if (dbPost && mdxPost.content !== dbPost.content) {
			const {
				slug,
				title,
				date,
				description,
				imageUrl,
				imageCredit,
				imageAlt,
				categories,
			} = await parseFrontmatter(mdxPost.content)
			updated.push({
				slug,
				title,
				date,
				description,
				imageUrl,
				imageCredit,
				imageAlt,
				categories,
				content: mdxPost.content,
				pagePath: mdxPost.pagePath,
			})
		}
	}

	// check if any posts have been created (i.e. they exist in the file system but not in the database)
	const created: UpsertedContent[] = []

	for (const mdxPost of mdxPosts) {
		const dbPost = dbPosts.find(dbPost => dbPost.slug === mdxPost.slug)
		if (!dbPost) {
			const {
				slug,
				title,
				date,
				description,
				imageUrl,
				imageCredit,
				imageAlt,
				categories,
			} = await parseFrontmatter(mdxPost.content)
			created.push({
				slug,
				title,
				date,
				description,
				imageUrl,
				imageCredit,
				imageAlt,
				categories,
				content: mdxPost.content,
				pagePath: mdxPost.pagePath,
			})
		}
	}

	// check if any images have been updated or created
	const updatedImages: string[] = []

	for (const mdxPost of mdxPosts) {
		const dbPost = dbPosts.find(dbPost => dbPost.slug === mdxPost.slug)
		if (!dbPost) {
			// this is a new image so the blurhash needs to be created
			updatedImages.push(mdxPost.pagePath)
		} else {
			// this is an existing post so we need to compare the image blobs
			const { imageUrl } = await parseFrontmatter(mdxPost.content)

			const imagePath = path.join(path.dirname(mdxPost.pagePath), imageUrl)
			const buffer = readFileSync(imagePath)
			const dbImageBuffer = Buffer.from(dbPost.image?.blob ?? '')

			// if the image blobs are different, we need to update the blurhash
			if (!buffer.equals(dbImageBuffer)) {
				updatedImages.push(mdxPost.pagePath)

				// we also need to update the post data
				// we actually only need to update the image blob but we'll update the whole post for simplicity
				const {
					slug,
					title,
					date,
					description,
					imageUrl,
					imageCredit,
					imageAlt,
					categories,
				} = await parseFrontmatter(mdxPost.content)
				updated.push({
					slug,
					title,
					date,
					description,
					imageUrl,
					imageCredit,
					imageAlt,
					categories,
					content: mdxPost.content,
					pagePath: mdxPost.pagePath,
				})
			}
		}
	}

	return {
		deleted,
		updated,
		created,
		updatedImages,
	}
}
// #endregion
