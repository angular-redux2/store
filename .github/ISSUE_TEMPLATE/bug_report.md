---
name: 🐞 Bug Report
title: 🐞 Bug Report
about: Something is broken
labels: [ "bug", "needs triage" ]
---

**Describe the bug**

A clear and concise description of what is wrong.

**Reproduction**

The smallest store setup and component that show the problem.

```ts
import { NgRedux, Select } from '@angular-redux2/store';

// configureStore call, reducer, and the component or service that misbehaves
```

**Expected behavior**

What you expected to happen.

**Actual behavior**

What actually happened. Include the full error message and stack trace if there is one.

```text
Error: ...
    at ...
```

**Environment**

|                                 | |
|---------------------------------|-|
| `@angular-redux2/store` version | |
| Angular version                 | |
| Redux version                   | |
| RxJS version                    | |
| Browser or Node.js version      | |

**Checklist**

- [ ] I have searched for existing issues, and this is not a duplicate.
- [ ] I am using the latest published version.
- [ ] I have included a minimal reproduction above.
