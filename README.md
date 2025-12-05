# ListingHub

## Overview

ListingHub is a mobile-first web application designed to organize course information and track deadlines using a shared checklist. Users can create or join the groups to collaborate on tasks with other members. While task lists are shared within the group, completion status is tracked individually for each user. Tasks also feature due dates and tags, allowing users to filter item efficiently.

Developed for the COMP 1800 course, this project applies User-Centred Design practices and Agile Project Management. It demonstrates full-stack integration with Firebase services for data storage and authentication.

---

## Features

- **Group Collaboration:** Create or join groups to share tasks with team members.
- **Easy Invitations:** Quickly invite new members by copying and sharing a unique group URL.
- **Individual Progress:** While tasks are shared, completion status is marked individually per user.
- **Task Management:** Organize items with due dates and tags for easy filtering.
- **Urgent Indicator:** Task items automatically turn red when the due date arrives to visually highlight urgency.

---

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Backend**: Firebase for hosting
- **Database**: Firestore

---

## Usage

1. Visit `https://listinghub.ruleofsix.ca/ `.
2. Create a group or join an existing one via a shared link.
3. Add tasks for the group, including due dates and tags.
4. Check off tasks as you finish them.

---

## Project Structure

```
1800_202530_BBY21 /           - HTML and project config files
├── src/                      - JavaScript logic and Firebase integration
│   ├── components/           - Reusable UI Components
├── styles/                   - Main CSS stylesheet
├── package.json
└── README.md
```

---

## Contributors

- **Min Lee** - BCIT CST Student with a passion for web devlopment and user-friendly applications. Fun fact: Writes code without a single drop of coffee.
- **Justin Watson** - BCIT CST Student who would rather be asleep, but still enjoys coding. Fun fact: Has won the U18 NSIHL playoffs
- **June Pyle** - BCIT CST Student with a passion for networking and low-level software. Fun fact: Loves solving Rubik's Cubes in under a minute.

---

## Acknowledgments

- Code snippets were adapted from resources such as [Stack Overflow](https://stackoverflow.com/) and [MDN Web Docs](https://developer.mozilla.org/).
- Icons sourced from [Google Icons](https://fonts.google.com/icons/).
- API sourced from [Tagify] (https://github.com/yairEO/tagify).

---

## Limitations and Future Work

### Limitations

- The application prioritizes core functionality over advanced features or complex UI elements.
- The UI layout and theme are currently fixed.

### Future Work

- Implement a calendar view to visualize upcoming deadlines.
- Add a profile setting page to allow users to change passwords and manage app preferences.
- Create a light mode to provide visual customization options for users.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
