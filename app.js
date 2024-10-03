document.addEventListener('DOMContentLoaded', function () {
    const toDoLink = document.getElementById('to-do-link');
    const calendarLink = document.getElementById('calendar-link');
    const doneListLink = document.getElementById('done-list-link');
    const gridViewLink = document.getElementById('grid-view-link');

    const toDoPage = document.getElementById('to-do-list-page');
    const calendarPage = document.getElementById('calendar-page');
    const doneListSection = document.getElementById('done-list-section');
    const gridViewPage = document.getElementById('grid-view-page');
    const taskGrid = document.getElementById('task-grid');

    const toDoList = document.getElementById('to-do-list');
    const doneList = document.getElementById('done-list');


    // Default view: To-Do List page
    showSection('to-do-list-page');

    // Event listeners for sidebar navigation
    toDoLink.addEventListener('click', function () {
        showSection('to-do-list-page');
    });

    calendarLink.addEventListener('click', function () {
        showSection('calendar-page');
    });

    doneListLink.addEventListener('click', function () {
        showSection('done-list-section');
    });

    gridViewLink.addEventListener('click', function () {
        showSection('grid-view-page');
        renderTaskGrid();
    });

    // Function to show one section and hide the others
    function showSection(sectionId) {
        const sections = document.querySelectorAll('.content');
        sections.forEach(function (section) {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
    }

    // Initialize FullCalendar
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        height: 'auto',
        contentHeight: '100%',
        aspectRatio: 1.5,
        events: []
    });
    calendar.render();

    // Form submission logic for adding tasks
    const form = document.getElementById('schedule-form');
    let tasks = [];

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const taskName = document.getElementById('task-name').value;
        const taskDate = document.getElementById('task-date').value;
        const taskPriority = document.getElementById('task-priority').value;
        const eventId = `task-${Date.now()}`;

        // Create task object and add to task list
        const task = {
            name: taskName,
            date: taskDate,
            priority: taskPriority,
            id: eventId
        };
        tasks.push(task);

        // Create new task element
        const toDoItem = document.createElement('li');
        toDoItem.draggable = true;
        toDoItem.innerHTML = `<strong>${taskName}</strong> - ${taskDate} [Priority: ${taskPriority}] <input type="checkbox" class="task-checkbox" data-event-id="${eventId}">`;

        toDoList.appendChild(toDoItem);

        // Add event to the calendar
        calendar.addEvent({
            id: eventId,
            title: taskName,
            start: taskDate,
            allDay: true
        });

        // Add checkbox behavior for marking tasks as done
        const checkbox = toDoItem.querySelector('.task-checkbox');
        checkbox.addEventListener('change', function () {
            if (checkbox.checked) {
                moveToDone(toDoItem, eventId);
            }
        });

        // Attach context menu functionality
        attachContextMenu(toDoItem, eventId);

        // Enable drag-and-drop reordering
        enableDragAndDrop(toDoList);

        form.reset();  // Clear form fields
    });

    // Function to move the task to "Done" and remove from calendar
    function moveToDone(taskItem, eventId) {
        taskItem.querySelector('.task-checkbox').remove();  // Remove checkbox
        doneList.appendChild(taskItem);  // Move to "Done" list
        calendar.getEventById(eventId).remove();  // Remove from calendar
    }

    // Context menu implementation
    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    document.body.appendChild(contextMenu);

    const contextMenuItems = [
        { text: 'Rename', action: renameTask },
        { text: 'Edit Properties', action: editTaskProperties },
        { text: 'Delete', action: deleteTask }
    ];

    contextMenuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        menuItem.textContent = item.text;
        menuItem.onclick = () => {
            item.action(currentTaskItem);
            hideContextMenu();
        };
        contextMenu.appendChild(menuItem);
    });

    let currentTaskItem;

    function attachContextMenu(taskItem, eventId) {
        taskItem.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            currentTaskItem = { taskItem, eventId };
            contextMenu.style.left = `${e.pageX}px`;
            contextMenu.style.top = `${e.pageY}px`;
            contextMenu.style.display = 'block';
        });
    }

    // Hide context menu when clicking outside
    document.addEventListener('click', hideContextMenu);

    function hideContextMenu() {
        contextMenu.style.display = 'none';
    }

    // Context menu actions
    function renameTask({ taskItem }) {
        const newName = prompt('Enter new task name:', taskItem.querySelector('strong').textContent);
        if (newName) {
            taskItem.querySelector('strong').textContent = newName;
            // Update the associated calendar event name
            const event = calendar.getEventById(currentTaskItem.eventId);
            if (event) event.setProp('title', newName);
            // Update the grid
            // updateGrid(currentTaskItem); // Update the grid with the new name
        }
    }

    function editTaskProperties({ taskItem }) {
        const newPriority = prompt('Enter new priority (Low, Medium, High):', 'Low');
        if (newPriority) {
            const priorityText = ` [Priority: ${newPriority}]`;
            taskItem.innerHTML = taskItem.innerHTML.replace(/\[Priority:.*\]/, priorityText);
            // Update the calendar event description
            const event = calendar.getEventById(currentTaskItem.eventId);
            if (event) event.setExtendedProp('description', `Priority: ${newPriority}`);
            // updateGrid(currentTaskItem); // Update the grid with the new priority
        }
    }

    function deleteTask({ taskItem, eventId }) {
        // Remove the task item from the list
        taskItem.remove();
        // Remove the associated event from the calendar
        calendar.getEventById(eventId).remove();
    }

    // Function to update the grid
    function updateGrid(taskItem) {
        const taskTitle = taskItem.querySelector('strong').textContent;
        const taskDate = taskItem.getAttribute('data-date'); // Make sure to store the date as a data attribute
        const taskPriority = taskItem.querySelector('span').textContent.match(/Priority: (\w+)/)[1]; // Extract priority from text

        // Find the corresponding item in the grid and update it
        const gridItem = document.querySelector(`.grid-item[data-title="${taskTitle}"]`);
        if (gridItem) {
            gridItem.textContent = taskTitle; // Update the title
            gridItem.setAttribute('data-priority', taskPriority); // Update the priority attribute
            // Reposition the grid item if necessary based on new priority and urgency
            repositionGridItem(gridItem, taskDate, taskPriority);
        }
    }

    // Function to reposition grid items based on urgency (date) and priority
    function repositionGridItem(gridItem, taskDate, taskPriority) {
        const urgencyIndex = calculateUrgencyIndex(taskDate); // Implement this function based on your urgency logic
        const priorityIndex = getPriorityIndex(taskPriority); // Implement this function based on your priority logic

        // Set the position of the grid item based on calculated indices
        gridItem.style.gridRowStart = urgencyIndex;
        gridItem.style.gridColumnStart = priorityIndex;
    }

    // Helper functions to calculate indices based on date and priority
    function calculateUrgencyIndex(taskDate) {
        // Implement logic to calculate urgency index based on the date (e.g., earlier dates get lower index)
        // Return an appropriate grid row index
    }

    function getPriorityIndex(taskPriority) {
        // Implement logic to return a column index based on the task priority (e.g., high -> 1, medium -> 2, low -> 3)
    }

    // Enable drag-and-drop reordering for the to-do list
    function enableDragAndDrop(list) {
        let draggedItem = null;

        list.addEventListener('dragstart', function (e) {
            draggedItem = e.target;
            setTimeout(function () {
                draggedItem.style.display = 'none';
            }, 0);
        });

        list.addEventListener('dragend', function () {
            setTimeout(function () {
                draggedItem.style.display = 'block';
                draggedItem = null;
            }, 0);
        });

        list.addEventListener('dragover', function (e) {
            e.preventDefault();
            const afterElement = getDragAfterElement(list, e.clientY);
            const draggable = draggedItem;
            if (afterElement == null) {
                list.appendChild(draggable);
            } else {
                list.insertBefore(draggable, afterElement);
            }
        });
    }

    function getDragAfterElement(list, y) {
        const draggableElements = [...list.querySelectorAll('li:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Add drag-and-drop functionality to existing items
    const existingItems = document.querySelectorAll('#to-do-list li');
    existingItems.forEach(item => {
        attachContextMenu(item, item.querySelector('.task-checkbox').getAttribute('data-event-id'));
        enableDragAndDrop(toDoList);  // Make sure drag-and-drop is enabled for existing items
    });


    // Render Task Grid View
    function renderTaskGrid() {
        taskGrid.innerHTML = ''; // Clear previous grid content

        tasks.forEach(task => {
            const urgencyLevel = calculateUrgencyLevel(task.date);
            const priorityLevel = calculatePriorityLevel(task.priority);

            const taskBox = document.createElement('div');
            taskBox.className = `task-box ${task.priority}`;
            taskBox.textContent = task.name;

            // Position task box based on urgency and priority
            taskBox.style.left = `${priorityLevel * 33}%`;
            taskBox.style.top = `${urgencyLevel * 33}%`;

            taskGrid.appendChild(taskBox);
        });
    }

    // Function to calculate urgency level based on date
    function calculateUrgencyLevel(dateString) {
        const today = new Date();
        const taskDate = new Date(dateString);
        const daysUntilTask = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntilTask < 0) return 3; // Past due
        else if (daysUntilTask < 3) return 0; // Urgent (next 3 days)
        else if (daysUntilTask < 7) return 1; // Soon (next week)
        else return 2; // Later (next more than a week)
    }

    // Function to calculate priority level (0: high, 1: medium, 2: low)
    function calculatePriorityLevel(priority) {
        if (priority === 'high') return 0;
        else if (priority === 'medium') return 1;
        else return 2;
    }

    // Add context menu for task options
    toDoList.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        const target = e.target.closest('li');

        if (target) {
            showContextMenu(e.pageX, e.pageY, target);
        }
    });

    function showContextMenu(x, y, target) {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;

        const renameOption = document.createElement('div');
        renameOption.innerText = 'Rename';
        renameOption.addEventListener('click', function () {
            const newName = prompt('Enter new task name:', target.querySelector('strong').innerText);
            if (newName) {
                target.querySelector('strong').innerText = newName;
            }
            document.body.removeChild(menu);
        });

        const deleteOption = document.createElement('div');
        deleteOption.innerText = 'Delete';
        deleteOption.addEventListener('click', function () {
            const eventId = target.querySelector('.task-checkbox').dataset.eventId;
            target.remove();
            calendar.getEventById(eventId)?.remove(); // Remove from calendar
            tasks = tasks.filter(task => task.id !== eventId); // Remove from tasks
            renderTaskGrid(); // Update grid view
            document.body.removeChild(menu);
        });

        menu.appendChild(renameOption);
        menu.appendChild(deleteOption);
        document.body.appendChild(menu);

        document.addEventListener('click', function () {
            if (menu) document.body.removeChild(menu);
        });
    }
});