# Contribution Workshop: Wall of Fame

Make your first open-source contribution—no manual JSON editing required!

This repository is designed for educational events teaching students how to contribute via a smooth, beginner-friendly workflow:
- Offline form to generate your contribution JSON file
- Automatic validation, formatting, and conflict-free merging
- A “Wall of Fame” table in this README generated from stored contributor data

Badges:  
![status](https://img.shields.io/badge/Status-Automated%20PR%20Validation-brightgreen) ![license](https://img.shields.io/badge/License-MIT-blue)

## How it works
1. Open index.html locally (double-click) to use the offline form.
2. Fill your Full Name, Roll Number (like 24bca001), and GitHub Username.
3. Click “Download JSON” to save your contribution file.
4. Fork this repo, create a new branch, and add your JSON file to the submissions/ folder.
5. Open a Pull Request (PR).
6. A bot validates and enforces rules automatically:
   - Ensures valid JSON and correct fields
   - Prevents duplicates and invalid roll numbers or usernames
   - Rejects changes outside submissions/
   - Comments on PRs that don’t meet rules
7. Valid PRs are auto-merged without maintainer intervention.
8. After merge, the bot updates:
   - data/contributors.json (sorted, valid JSON)
   - The “Wall of Fame” table below

This process works across Windows, macOS, and Linux, and requires no installation from contributors.

## Rules for contributions
- Do not edit data/contributors.json or this README manually.
- Add exactly one JSON file to submissions/ named after your GitHub username, e.g., submissions/janedoe.json.
- JSON fields required:
  - fullName: string (your full name)
  - rollNumber: string (pattern like 24bca001)
  - github: string (your GitHub username)
- No duplicates of rollNumber or GitHub username.
- Everything else is automated.

## Use the offline form
- Open index.html locally to generate your JSON contribution.
- The form validates inputs and lets you download a ready-to-commit JSON file.

## “Wall of Fame”
Below is the automatically generated list of contributors. Do not edit this section manually.

<!-- WALL_OF_FAME_START -->
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Full Name</th>
      <th>Roll No.</th>
      <th>GitHub</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Aanya Gupta</td>
      <td><code>24bca001</code></td>
      <td><a href="https://github.com/aanyagupta">@aanyagupta</a></td>
    </tr>
    <tr>
      <td>2</td>
      <td>Rahul Verma</td>
      <td><code>24bca002</code></td>
      <td><a href="https://github.com/rahulverma">@rahulverma</a></td>
    </tr>
  </tbody>
</table>
<!-- WALL_OF_FAME_END -->

## Getting started (Quick)
1. Fork this repository.
2. Create a new branch: feature/add-your-name.
3. Open index.html and generate your JSON.
4. Place the downloaded file into submissions/ (e.g., submissions/yourusername.json).
5. Commit and push your branch.
6. Open a Pull Request. The bot will do the rest.

## License
This project is licensed under the MIT License. See LICENSE.

## Maintainers
- Automated by GitHub Actions for validation, auto-merge, and README updates.