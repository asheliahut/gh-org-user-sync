#!/usr/bin/env node

import { Octokit } from "@octokit/rest";
import { SingleBar, Presets } from "cli-progress";
import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";

// Get all members of GitHub organization handling pagination using octokit
export async function getAllMembers(
  octokit: Octokit,
  org: string,
  page: number = 1,
  pageSize: number = 100
): Promise<string[]> {
  const response = await octokit.orgs.listMembers({
    org,
    page,
    per_page: pageSize,
  });
  const memberLogins: string[] = response.data.map((member) => member.login);
  if (response.data.length === pageSize) {
    return memberLogins.concat(
      await getAllMembers(octokit, org, page + 1, pageSize)
    );
  }
  return memberLogins;
}

// filter sourceMembers to remove members that are not in targetMembers using set
function findMissingMembers(
  sourceMembers: string[],
  targetMembers: string[]
): string[] {
  const targetSet = new Set(targetMembers);
  return sourceMembers.filter((member) => !targetSet.has(member));
}

(async () => {
  const optionDefinitions = [
    {
      name: "help",
      alias: "h",
      type: Boolean,
      desription: "Shows this help message",
    },
    {
      name: "source",
      alias: "s",
      type: String,
      description:
        "Source GitHub organization name (pulls users from this org)",
      typeLabel: "<org_name>",
    },
    {
      name: "target",
      alias: "t",
      type: String,
      description: "Target GitHub organization name (pushes users to this org)",
      typeLabel: "<org_name>",
    },
    {
      name: "url",
      alias: "u",
      type: String,
      description: "GitHub API url (defaults to https://api.github.com)",
      defaultValue: "https://api.github.com",
    },
    {
      name: "verbose",
      alias: "v",
      type: Number,
      defaultValue: 0,
      description: "Verbosity level (0-2)",
    },
  ];

  const usage = commandLineUsage([
    {
      header: "GitHub Oranization Member Sync",
      content:
        "Syncs the members of a GitHub organization to a new GitHub organization \n Make sure to include environment variables for the GitHub API Token(GH_USER_SYNC_TOKEN) with org admin & user access privileges.",
    },
    {
      header: "Options",
      optionList: optionDefinitions,
    },
    {
      content:
        "Project home: {underline https://github.com/asheliahut/gh-org-user-sync}",
    },
  ]);

  const options = commandLineArgs(optionDefinitions);

  if (options.help || !options.source || !options.target) {
    console.log(usage);
    return 0;
  }

  const progressBar = new SingleBar({}, Presets.shades_classic);
  const octokit = new Octokit({
    baseUrl: options.url,
    auth: `token ${process.env.GH_USER_SYNC_TOKEN}`,
  });

  try {
    const sourceMembers = await getAllMembers(octokit, options.source);
    const targetMembers = await getAllMembers(octokit, options.target);
    const missingMembers = findMissingMembers(sourceMembers, targetMembers);

    if (options.verbose >= 1) {
      console.log("# Source members:", sourceMembers.length);
      console.log("# Target members:", targetMembers.length);
      console.log("# Missing members:", missingMembers.length);
    }
    if (options.verbose >= 2) {
      console.log("Source members:", sourceMembers);
      console.log("Target members:", targetMembers);
      console.log("Missing members:", missingMembers);
    }

    let progresCounter: number = 0;
    let numbersucessfullyAdded: number = 0;
    let numberFailedToAdd: number = 0;
    progressBar.start(missingMembers.length, 0);

    for (const missingMember of missingMembers) {
      const response = await octokit.orgs.setMembershipForUser({
        org: options.target,
        username: missingMember,
        role: "member",
      });

      if (options.verbose >= 2) {
        console.log(response);
      }

      if (response.status === 200) {
        progressBar.update(progresCounter++, {
          username: missingMember,
          type: "success",
        });

        if (options.verbose >= 1) {
          console.log(`Added ${missingMember}`);
        }

        numbersucessfullyAdded++;
      } else {
        progressBar.update(progresCounter++, {
          username: missingMember,
          type: "failed",
        });

        if (options.verbose >= 1) {
          console.log(`Failed to add ${missingMember}`);
        }

        numberFailedToAdd++;
      }
    }
    progressBar.stop();

    console.log(`\nSuccessfully added ${numbersucessfullyAdded} members`);
    console.log(`\nFailed to add ${numberFailedToAdd} members`);
  } catch (error) {
    progressBar.stop();
    console.error(error);
  }
})();
