# Spec Tree

**Transform ideas into structured, actionable work items with AI-powered project specifications.**

Spec Tree is a sophisticated project management application that streamlines the creation, organization, and management of Epics, Features, User Stories, and Tasks. By combining AI-driven assistance with intuitive context gathering, Spec Tree helps teams generate high-quality work items and project roadmaps in a fraction of the time.

---

## Why Spec Tree?

Traditional project planning is slow, error-prone, and often results in misaligned teams. Spec Tree solves this by:

- **Automating the breakdown** of complex ideas into hierarchical work items
- **Capturing rich context** that propagates through your entire project structure
- **Leveraging AI** to ask the right questions and generate comprehensive specifications
- **Preserving institutional knowledge** so teams can build on past successes

### Key Benefits

| For Teams | For Businesses |
|-----------|----------------|
| Eliminate ambiguity in requirements | Reduce planning time by up to 70% |
| Reuse proven workflows across projects | Minimize costly rework from unclear specs |
| Onboard new members faster | Accelerate time-to-market |
| Stay aligned with real-time context updates | Scale project management efficiently |

---

## Features

### AI-Powered Context Gathering
The AI Assistant generates tailored questions to refine your input, ensuring no critical details are missed. Context flows automatically from Epics down to Tasks, keeping everyone aligned.

### Hierarchical Work Item Management
- **Epics** → High-level business objectives
- **Features** → Functional capabilities
- **User Stories** → User-centric requirements
- **Tasks** → Actionable implementation steps

### Reusable Templates & Knowledge Base
Start new projects from proven templates. Every work item becomes part of your organizational knowledge base, complete with historical estimates, associated PRs, designs, and documentation.

### Import/Export & Integrations
- CSV import/export for tools like ClickUp, Jira, and Asana
- JSON export for API integrations
- Seamless data migration between platforms

### Comprehensive Analytics
- Track estimated vs. actual effort
- Identify bottlenecks and patterns
- Measure team performance over time

---

## Architecture

Spec Tree is a full-stack application with three main components:

```
spec-tree/
├── Client/          # Next.js 14 frontend (React, TypeScript, Tailwind CSS)
├── Server/          # Strapi CMS backend (Node.js, PostgreSQL)
├── Microservice/    # OpenAI API proxy (Express.js, TypeScript)
├── docs/            # Documentation and architecture guides
└── reference/       # Templates and workflow patterns
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui |
| **State Management** | Redux Toolkit |
| **Backend CMS** | Strapi 5 (headless CMS) |
| **Database** | PostgreSQL |
| **AI Integration** | OpenAI API (GPT-4) |
| **Authentication** | Strapi Users & Permissions |
| **Deployment** | Render (PaaS) |

---

## Getting Started

### Prerequisites

- Node.js 18+ (20 recommended)
- PostgreSQL 14+
- OpenAI API key

### Local Development

**1. Clone the repository**
```bash
git clone https://github.com/dmhernandez2525/spec-tree.git
cd spec-tree
```

**2. Set up the database**
```bash
# Create a PostgreSQL database
createdb spec_tree
```

**3. Configure environment variables**

```bash
# Client
cp Client/.env.example Client/.env.local
# Edit Client/.env.local with your values

# Server
cp Server/.env.example Server/.env
# Edit Server/.env with your database credentials

# Microservice
# Create Microservice/.env with:
# OPENAI_API_KEY=your_key_here
# PORT=3001
```

**4. Install dependencies and start services**

```bash
# Terminal 1 - Strapi CMS
cd Server && npm install && npm run dev

# Terminal 2 - OpenAI Microservice
cd Microservice && npm install && npm run dev

# Terminal 3 - Next.js Client
cd Client && npm install && npm run dev
```

**5. Access the application**
- Client: http://localhost:3000
- Strapi Admin: http://localhost:1337/admin
- Microservice: http://localhost:3001

---

## Deployment

Spec Tree is configured for one-click deployment on [Render](https://render.com) using Infrastructure as Code.

### Deploy to Render

1. Fork this repository
2. Create a new **Blueprint** in Render
3. Connect your forked repository
4. Render will automatically provision:
   - Next.js client (web service)
   - Strapi CMS (web service + persistent disk)
   - OpenAI microservice (web service)
   - PostgreSQL database

5. Configure sensitive environment variables marked as `UPDATE_ME`:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `NEXT_PUBLIC_STRAPI_TOKEN` - Generate in Strapi admin
   - Stripe keys (if using payments)

See [`render.yaml`](./render.yaml) for the full configuration.

### Estimated Costs (Render)

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Client | Starter | $7 |
| Strapi | Starter + 1GB disk | $7 |
| Microservice | Starter | $7 |
| PostgreSQL | Basic 256MB | $6 |
| **Total** | | **~$27/month** |

---

## Project Structure

### Client (`/Client`)

The Next.js frontend application with:
- Marketing pages (landing, pricing, features)
- Authentication (login, register, password reset)
- Dashboard with project management UI
- Spec Tree builder component
- Theme configurator

See [Client/README.md](./Client/README.md) for detailed functionality breakdown.

### Server (`/Server`)

Strapi headless CMS providing:
- RESTful API for all data operations
- User authentication and permissions
- Content type management
- Media library

### Microservice (`/Microservice`)

Express.js service that:
- Proxies requests to OpenAI API
- Handles rate limiting and validation
- Manages AI context and prompts
- Provides secure API key management

### Documentation (`/docs`)

- Architecture documentation
- API references
- Audit reports and roadmaps
- Development guides

---

## Use Cases

### Software Development Teams
Break down complex features into well-defined user stories and tasks. Track implementation progress with linked PRs and documentation.

### Product Managers
Create detailed Epics with AI-assisted context gathering. Ensure alignment between business goals and technical implementation.

### Consultants & Agencies
Generate comprehensive project proposals quickly. Reuse proven templates across client engagements.

### Startups
Move fast without sacrificing planning quality. Build institutional knowledge from day one.

---

## Roadmap

- [ ] Real-time collaboration
- [ ] Advanced analytics dashboard
- [ ] Jira/Linear direct integration
- [ ] Custom AI model fine-tuning
- [ ] Mobile application
- [ ] Team workspace management

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

**Daniel Hernandez**
[brainydeveloper.com](https://brainydeveloper.com)

---

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Strapi](https://strapi.io/) - Headless CMS
- [OpenAI](https://openai.com/) - AI capabilities
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Render](https://render.com/) - Cloud platform
