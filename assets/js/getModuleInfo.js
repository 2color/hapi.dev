let axios = require("axios")
let Semver = require("semver")
let Yaml = require("js-yaml")
let fs = require("fs")
require("dotenv").config()

getInfo()

async function getInfo() {
  let repos = {}
  let newRepos = {}
  const options = {
    headers: {
      accept: "application/vnd.github.v3.raw+json",
      authorization: "token " + process.env.GITHUB_TOKEN
    }
  }
  let repositories = await axios.get(
    "https://api.github.com/orgs/hapijs/repos?per_page=100",
    options
  )
  for (let r = 0; r < repositories.data.length; ++r) {
    let branches = await axios.get(
      "https://api.github.com/repos/hapijs/" +
        repositories.data[r].name +
        "/branches",
      options
    )
    if (
      repositories.data[r].name !== "assets" &&
      repositories.data[r].name !== ".github" &&
      repositories.data[r].name !== "hapi.dev"
    ) {
      repos[repositories.data[r].name] = {
        name: repositories.data[r].name,
        versions: [],
        versionsArray: []
      }
      for (let branch of branches.data) {
        if (branch.name.match(/^v+[0-9]+|\bmaster\b/g)) {
          const gitHubVersion = await axios.get(
            "https://api.github.com/repos/hapijs/" +
              repositories.data[r].name +
              "/contents/package.json?ref=" +
              branch.name,
            options
          )
          const nodeYaml = await axios.get(
            "https://api.github.com/repos/hapijs/" +
              repositories.data[r].name +
              "/contents/.travis.yml?ref=" +
              branch.name,
            options
          )

          let nodeVersions = Yaml.safeLoad(nodeYaml.data).node_js.reverse()
          if (
            !repos[repositories.data[r].name].versions.some(
              v =>
                v.branch === "master" && v.name === gitHubVersion.data.version
            ) ||
            gitHubVersion.data.name.includes("commercial")
          ) {
            repos[repositories.data[r].name].versionsArray.push(gitHubVersion.data.version)
            repos[repositories.data[r].name].versions.push({
              name: gitHubVersion.data.version,
              branch: branch.name,
              license: gitHubVersion.data.name.includes("commercial")
                ? "Commercial"
                : "BSD",
              node: nodeVersions.join(", ").replace("node,", ""),
            })
          }
          await repos[repositories.data[r].name].versions.sort(function(a, b) {
            return Semver.compare(b.name, a.name)
          })
        }
      }
    }

    const orderedRepos = {}
    await Object.keys(repos)
      .sort()
      .forEach(function(key) {
        orderedRepos[key] = repos[key]
      })

    let hapi = orderedRepos.hapi

    delete orderedRepos.hapi

    newRepos = await Object.assign({ hapi }, orderedRepos)
  }
  await fs.writeFile('./static/lib/moduleInfo.json', JSON.stringify(newRepos), function(err) {
    if (err) throw err
  })
}

