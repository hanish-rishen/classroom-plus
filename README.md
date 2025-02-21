<div align="center">
  <img src="public/logo.png" alt="Classroom Plus Logo" width="200"/>
  <h1>Classroom Plus</h1>
  <p>A Modern Enhancement for Google Classroom</p>

  <div>
    <img src="https://img.shields.io/badge/Next.js-13-black" alt="Next.js" />
    <img src="https://img.shields.io-badge/TypeScript-5.0-blue" alt="TypeScript" />
    <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
    <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen" alt="PRs Welcome" />
  </div>
</div>

## ✨ Overview

Classroom Plus enhances your Google Classroom experience with a modern, intuitive interface and powerful features designed to streamline your academic workflow.

## 🚀 Key Features

- **Intelligent Dashboard**: Comprehensive overview of your academic activities
- **Smart Assignment Tracking**: Never miss deadlines with organized coursework management
- **Resource Organization**: Centralized access to study materials
- **Real-time Updates**: Stay informed with instant notifications
- **Responsive Design**: Seamless experience across all devices
- **Theme Customization**: Multiple color schemes and dark mode support

## 📸 Screenshots

<div align="center">
  <img src="screenshots/dashboard.png" alt="Dashboard" width="600"/>
  <p><em>Modern Dashboard Interface</em></p>

  <img src="screenshots/classes.png" alt="Classes View" width="600"/>
  <p><em>Enhanced Class Management</em></p>
</div>

## 🛠️ Tech Stack

- **Framework**: [Next.js 13](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **API**: [Google Classroom API](https://developers.google.com/classroom)
- **State Management**: [TanStack Query](https://tanstack.com/query)

## 🚦 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/HanishRishen/classroom-plus.git
   cd classroom-plus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in required credentials:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 👥 Contributing

We welcome contributions! Here's how you can help:

### Development Process

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit with meaningful messages: `git commit -m 'feat: add new feature'`
6. Push to your fork: `git push origin feature/your-feature`
7. Open a Pull Request

### Code Style Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write meaningful component and function names
- Add comments for complex logic
- Keep components small and focused

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test updates
- `chore:` Maintenance tasks

### Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Get approval from maintainers
5. Squash commits if requested

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with ♥️ by [Hanish Rishen](https://www.linkedin.com/in/hanish-rishen-331072248/)

---

<div align="center">
  <p>© 2023 Classroom Plus. Not affiliated with Google Classroom.</p>
  <p>
    <a href="https://github.com/HanishRishen/classroom-plus/issues">Report Bug</a>
    ·
    <a href="https://github.com/HanishRishen/classroom-plus/issues">Request Feature</a>
  </p>
</div>
