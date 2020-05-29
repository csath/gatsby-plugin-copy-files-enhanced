const path = require('path');
const fsExtra = require('fs-extra');

const getDirectories = source =>
	fsExtra.readdirSync(source, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name)

const regex1 = RegExp('(.*)\\/\\*(.*)');

exports.onCreateNode = ({ node }, pluginOptions) => {
	const { source, destination = '', purge = false } = pluginOptions;
	const sourceNormalized = path.normalize(source);
	if (node.internal.type === 'File') {
		const dir = path.normalize(node.dir);
		if (dir.includes(sourceNormalized)) {
			const relativeToDest = dir.replace(sourceNormalized, '');

			// if regex enabled
			if (regex1.test(destination)) {
				const hits = regex1.exec(destination)
			
				if (!hits) return
				
				const regPrefix = hits[1]
				const regPostfix = hits[2]

				const dirList = getDirectories(path.join(process.cwd(), 'public', regPrefix))		
				
				dirList.forEach(e => {
					const newDestination = regPrefix + '/' + e + regPostfix;					
					const newPath = path.join(
						process.cwd(),
						'public',
						newDestination,
						relativeToDest,
						node.base
					);
					fsExtra.copy(node.absolutePath, newPath, { overwrite: purge }, err => {
						if (err) {
							console.error('Error copying file', err);
						}
					});
				})
			}
			// if regex not enabled
			else {
				const newPath = path.join(
					process.cwd(),
					'public',
					destination,
					relativeToDest,
					node.base
				);

				fsExtra.copy(node.absolutePath, newPath, { overwrite: purge }, err => {
					if (err) {
						console.error('Error copying file', err);
					}
				});
			}
		}
	}
};
