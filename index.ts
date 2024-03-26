import * as core from '@actions/core'
import * as github from '@actions/github'

type StatusState = 'error' | 'failure' | 'pending' | 'success'

const getRequiredInput = (name: string): string =>
  core.getInput(name, { required: true })
;(async () => {
  const sha = core.getInput('sha') || github.context.sha
  const state = getRequiredInput('state') as StatusState
  const description = core.getInput('description')
  const contextInput = getRequiredInput('context')
  const context = contextInput.trim().split('\n');
  const targetUrl = core.getInput('target_url')
  const githubToken = core.getInput('github_token')
  const octokit = new github.GitHub(githubToken)

  for (const contextElement of context) {
    await octokit.repos.createStatus({
      ...github.context.repo,
      sha,
      state,
      description,
      context: contextElement,
      ...(targetUrl && { target_url: targetUrl })
    })
    console.log(`Successfully posted a GitHub commit status for ${contextElement}.`)
}
})().catch(error => {
  console.error(error)
  core.setFailed(error.message)
})
