# BookBlast: Weekly New Release Notifier

BookBlast is an application that automatically scrapes a book website for new releases and sends weekly email updates.

## Features

- Web scrapes a book website to gather the latest releases.
- Sends a weekly email with the newly discovered books.
- Easy to configure with environment variables for security.

## Prerequisites

- Node.js
- npm

## Installation

1. Clone this repository:

```bash
git clone https://github.com/JulieDEE/Scrapp-App-Weekly-New-Release-Notifier.git
```

2. Navigate to the project folder and install dependencies:
```bash
cd path_to_project_folder
npm install
```

3. Create a .env file in the root of the project for your environment variables (like email login details for sending emails). Make sure to never push this file to Git.
```bash
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
SITE_URL=your_site_to_scrapp
PORT=port
```

4. Start the application
```bash
npm start
```

## Contributing
If you'd like to contribute to the project, please create a pull request or open an issue for any suggestions or fixes.





