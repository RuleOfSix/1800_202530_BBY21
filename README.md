# ListingHub

## Overview

ListingHub is a mobile-first web application designed to organize course information and track deadlines using a shared checklist. Users can create or join the groups to collaborate on tasks with other members. While task lists are shared within the group, completion status is tracked individually for each user. Tasks also feature due dates and tags, allowing users to filter item efficiently. 

Developed for the COMP 1800 course, this project applies User-Centred Design practices and Agile Project Management. It demonstrates full-stack integration with Firebase services for data storage and authentication. It was designed to provide a tool to BCIT students struggling to share course information with each other in an organized manner to keep each other on track.

---

## Features

- **Group Collaboration:** Create or join groups to share tasks with team members.
- **Easy Invitations:** Quickly invite new members by copying and sharing a unique group URL.
- **Individual Progress:** While tasks are shared, completion status is marked individually per user.
- **Task Management:** Organize items with due dates and tags for easy filtering.
- **Urgent Indicator:** Task items automatically turn red when the due date arrives to visually highlight urgency.

---

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript, [Bootstrap](https://https://getbootstrap.com/), [Tagify](https://github.com/yairEO/tagify)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Backend**: Firebase for hosting and authentication
- **Database**: Firestore

---

## Usage

1. Visit `https://listinghub.ruleofsix.ca/ `.
2. Select the group you want to view tasks for
    2a. You can create a group by clicking on the plus icon, or join an existing one via a shared link.
3. Select the week you want to view by clicking the green arrows on either side of the current date range at the top of the page
4. Check them off as you complete them
    - Tasks can be added to a group by clicking the plus icon at the bottom and filling out the name, due date, and optional tags
    - You can filter tasks by completion status or by their tag(s) with the 'Filter By...' button on the top-left

---

## Project Structure

```
1800_202530_BBY21 /           - HTML and project config files
├── src/                      - JavaScript logic
│   └── components/           - Reusable UI Components
└── styles/                   - CSS styles
```

---

## Contributors

- **Min Lee** - BCIT CST Student with a passion for web devlopment and user-friendly applications. Fun fact: Writes code without a single drop of coffee.
- **Justin Watson** - BCIT CST Student who would rather be asleep, but still enjoys coding. Fun fact: Has won the U18 NSIHL playoffs
- **June Pyle** - BCIT CST Student with a passion for networking and low-level software. Fun fact: Loves tinkering with retro computers.

---

## Acknowledgments

- Code snippets were adapted from resources such as [Stack Overflow](https://stackoverflow.com/) and [MDN Web Docs](https://developer.mozilla.org/).
- Icons sourced from [Google Material Icons](https://fonts.google.com/icons/).

---

## Limitations and Future Work

### Limitations

- The application prioritizes core functionality over advanced features or complex UI elements.
- The UI layout and theme are currently fixed.
- The tag autocomplete suggestion list currently only shows tags in currently visible tasks, instead of all tasks in the group
- No way to edit tasks; instead, you have to delete and re-create them

### Future Work

- Add the ability to edit tasks
- Optimize checklist rendering
- Expand tag suggestion list to all tags in the group
- Implement a calendar view to visualize upcoming deadlines.
- Add a profile setting page to allow users to change passwords and manage app preferences.
- Create a light mode to provide visual customization options for users.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
