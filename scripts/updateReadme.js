const path = require('path')
const fs = require('fs-extra')
const consola = require('consola')
const packages = require('./packages')

const srcDir = path.resolve(__dirname, '../packages')
const storybookUrl = 'https://vueuse.js.org'

async function updateReadme() {
  packages.reverse()

  let addOnsList = ''

  for (const [pkg, packageOptions = {}] of packages) {
    const packageDir = path.join(srcDir, pkg)
    const readmePath = pkg === 'core'
      ? path.resolve(__dirname, '../README.md')
      : path.join(srcDir, pkg, 'README.md')

    const functions = fs
      .readdirSync(packageDir)
      .filter(f => f.startsWith('use') || f.startsWith('create'))
      .sort()

    consola.info(`${functions.length} functions found for "${pkg}"`)

    const categories = {}
    for (const name of functions) {
      const raw = fs.readFileSync(path.join(packageDir, name, 'index.stories.tsx'), 'utf-8')
      const match = /storiesOf\('(.+)'[\s\S]+?\.add\('(.+)'/gm.exec(raw)

      if (!match)
        continue

      const [, category] = match

      if (!category)
        continue

      const categoryName = category.split('|').slice(-1).join(' ')

      if (!categories[categoryName])
        categories[categoryName] = []

      categories[categoryName].push({
        name,
        url: `${storybookUrl}/?path=/story/${category.replace(/\|/g, '-')}--${name}`.toLowerCase(),
      })
    }

    let functionList = '\n\n'

    if (pkg !== 'core')
      addOnsList += `\n- ${packageOptions.name} ([\`@vueuse/${pkg}\`](${storybookUrl}/?path=/story/add-ons-${pkg}--read-me)) - ${packageOptions.description}\n`

    for (const category of Object.keys(categories).sort()) {
      functionList += `- ${category}\n`
      for (const { name, url } of categories[category]) {
        functionList += `  - [\`${name}\`](${url})\n`
        if (pkg !== 'core')
          addOnsList += `  - [\`${name}\`](${url})\n`
      }
      functionList += '\n'
    }

    let readme = fs.readFileSync(readmePath, 'utf-8')
    readme = readme.replace(/<!--FUNCTIONS_LIST_STARTS-->[\s\S]+?<!--FUNCTIONS_LIST_ENDS-->/m, `<!--FUNCTIONS_LIST_STARTS-->${functionList}<!--FUNCTIONS_LIST_ENDS-->`)

    if (pkg === 'core')
      readme = readme.replace(/<!--ADDONS_LIST_STARTS-->[\s\S]+?<!--ADDONS_LIST_ENDS-->/m, `<!--ADDONS_LIST_STARTS-->${addOnsList}<!--ADDONS_LIST_ENDS-->`)

    fs.writeFileSync(readmePath, readme, 'utf-8')

    consola.success(`README.md for "${pkg}" updated`)
  }
}

module.exports = { updateReadme }

if (require.main === module)
  updateReadme()
