# Contributing to Cloud-Native Microservices Platform

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on the code, not the person
- Help others learn and grow
- Report inappropriate behavior

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/Cloud_Native_Project.git
   cd "Cloud_Native Project"
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Set up development environment**
   ```bash
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   cd ui && npm install
   ```

## Development Guidelines

### Python Code

- Follow PEP 8 style guide
- Use type hints where possible
- Add docstrings to functions and classes
- Keep functions focused and small
- Write meaningful variable names

```python
def allocate_resources(
    resources: List[Resource],
    tasks: List[Task]
) -> List[Allocation]:
    """
    Allocate resources to tasks based on priority.
    
    Args:
        resources: Available compute resources
        tasks: Tasks requiring resource allocation
        
    Returns:
        List of allocations with satisfaction levels
    """
```

### JavaScript/TypeScript Code

- Use camelCase for variables and functions
- Use PascalCase for components and classes
- Add JSDoc comments for complex functions
- Keep components focused and reusable
- Use TypeScript for type safety

```typescript
/**
 * Dashboard component for system metrics visualization
 * @returns React component
 */
const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics[]>([]);
  // ...
}
```

### Commit Messages

- Use clear, descriptive messages
- Start with a verb: "Add", "Fix", "Update", "Remove", "Refactor"
- Keep first line under 50 characters
- Add detailed explanation in body if needed

```
Add CORS middleware to optimization service

- Allow requests from localhost:3000
- Support all HTTP methods
- Include proper CORS headers
```

### Pull Requests

1. **Describe the change**
   - What problem does it solve?
   - How does it solve it?
   - Any relevant issue numbers

2. **Include test coverage**
   - Add tests for new features
   - Ensure existing tests pass
   - Include test output in PR description

3. **Keep PRs focused**
   - One feature or fix per PR
   - Easier to review and merge

## Testing

### Python Tests

```bash
cd tests
pytest test_e2e.py -v
pytest test_unit.py -v
```

### React Tests

```bash
cd ui
npm test
```

### Manual Testing

1. Start all services
2. Access http://localhost:3000
3. Test the specific feature
4. Check browser console for errors
5. Verify API responses

## Documentation

- Update README.md for user-facing changes
- Add inline comments for complex logic
- Update API documentation in docstrings
- Create diagrams for architectural changes

## Reporting Issues

**Bug Report**
- Describe the bug clearly
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/logs if applicable
- Environment details

**Feature Request**
- Use case and benefits
- Example usage
- Potential implementation approach
- Any concerns or trade-offs

## Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code improvements
- `test/description` - Test additions

## Merge Process

1. Create pull request
2. Code review (at least 1 approval)
3. All tests passing
4. No merge conflicts
5. Squash and merge to main

## Release Process

1. Bump version in `package.json` and relevant files
2. Update CHANGELOG.md
3. Create git tag: `git tag v1.0.0`
4. Push changes and tags
5. Create GitHub release

## Questions?

- Check existing documentation
- Search closed issues for similar questions
- Open a discussion or issue
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Happy contributing! 🚀
