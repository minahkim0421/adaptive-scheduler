document.addEventListener('DOMContentLoaded', function () {
    const toDoLink = document.getElementById('to-do-link');
    const calendarLink = document.getElementById('calendar-link');
    const trashLink = document.getElementById('trash-link');
    const toDoPage = document.getElementById('to-do-list-page');
    const calendarPage = document.getElementById('calendar-page');
    const trashPage = document.getElementById('trash-page');
    const form = document.getElementById('schedule-form');
    const toDoList = document.getElementById('to-do-list');
    const trashList = document.getElementById('trash-list');

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
        events: [] // Placeholder for events
    });
    calendar.render();


    // Default view: To-Do List page
    toDoPage.classList.add('active');

    // Switch between views
    toDoLink.addEventListener('click', function () {
        toDoPage.classList.add('active');
        calendarPage.classList.remove('active');
        // trashPage.classList.remove('active');
    });

    calendarLink.addEventListener('click', function () {
        toDoPage.classList.remove('active');
        calendarPage.classList.add('active');
        calendar.render();
    });

    // Handle form submission for adding tasks
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        
        // Collect input values
        const taskName = document.getElementById('task-name').value;
        const taskDate = document.getElementById('task-date').value;
        // const taskTime = document.getElementById('task-time').value;
        const taskPriority = document.getElementById('task-priority').value;

        // Create a new task element
        const toDoItem = document.createElement('li');
        toDoItem.draggable = true;  // Make the item draggable
        toDoItem.innerHTML = `<strong>${taskName}</strong> - ${taskDate} [Priority: ${taskPriority}]`;

        // Add drag event listeners to the task item
        addDragAndDropHandlers(toDoItem);

        // Append the new task to the to-do list
        toDoList.appendChild(toDoItem);

        calendar.addEvent({
            title: taskName,
            start: taskDate,  // Use the date from the form
            allDay: true,     // Make it an all-day event
            description: `Priority: ${taskPriority}` // Optional description for the event
        });

        // Clear the form fields after adding the task
        form.reset();
    });

    // add drag and drop function to work in both pc and mobile
    function addDragAndDropHandlers(item) {
        item.addEventListener('dragstart', function (e) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', this.innerHTML);
            this.classList.add('dragging');
        });
    
        item.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            this.classList.add('drag-over');
        });
    
        item.addEventListener('dragleave', function () {
            this.classList.remove('drag-over');
        });
    
        item.addEventListener('drop', function (e) {
            e.preventDefault();
            e.stopPropagation();
    
            const draggedItemContent = e.dataTransfer.getData('text/plain');
            const currentItemContent = this.innerHTML;
    
            this.innerHTML = draggedItemContent;
            document.querySelector('.dragging').innerHTML = currentItemContent;
    
            document.querySelector('.dragging').classList.remove('dragging');
            this.classList.remove('drag-over');
        });
    
        item.addEventListener('dragend', function () {
            this.classList.remove('dragging');
        });
    
        // Add touch event listeners for mobile compatibility
        item.addEventListener('touchstart', function (e) {
            e.preventDefault();
            this.classList.add('dragging');
            const touch = e.touches[0];
            this.style.position = 'absolute';
            this.style.zIndex = '1000';
            this.style.left = touch.clientX + 'px';
            this.style.top = touch.clientY + 'px';
    
            // Move the item as the user moves their finger
            const moveHandler = (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                this.style.left = touch.clientX + 'px';
                this.style.top = touch.clientY + 'px';
            };
    
            // Listen for touchmove to move the item
            document.addEventListener('touchmove', moveHandler);
    
            // Handle touchend event
            const dropHandler = (e) => {
                e.preventDefault();
                document.removeEventListener('touchmove', moveHandler);
                this.classList.remove('dragging');
                this.style.position = 'relative';
                this.style.zIndex = '';
                // You might want to implement your drop logic here to handle dropping the item
            };
    
            // Listen for touchend to finalize the drag
            document.addEventListener('touchend', dropHandler, { once: true });
        });
    
        item.addEventListener('touchend', function () {
            this.classList.remove('dragging');
        });
    }    

    // Add drag-and-drop functionality to existing items
    const existingItems = document.querySelectorAll('#to-do-list li');
    existingItems.forEach(item => addDragAndDropHandlers(item));
});

document.addEventListener('DOMContentLoaded', function () {
    const toDoList = document.getElementById('to-do-list');
    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    document.body.appendChild(contextMenu);

    const contextMenuItems = [
        { text: 'Rename', action: renameTask },
        { text: 'Delete', action: deleteTask },
        { text: 'Change to...', action: changeTask },
    ];

    contextMenuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        menuItem.textContent = item.text;
        menuItem.onclick = () => {
            item.action();
            hideContextMenu();
        };
        contextMenu.appendChild(menuItem);
    });

    let currentTaskItem;

    toDoList.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        currentTaskItem = e.target.closest('li'); // Get the current task item
        if (currentTaskItem) {
            contextMenu.style.left = `${e.pageX}px`;
            contextMenu.style.top = `${e.pageY}px`;
            contextMenu.style.display = 'block';
        }
    });

    document.addEventListener('click', hideContextMenu);

    function hideContextMenu() {
        contextMenu.style.display = 'none';
    }

    function renameTask() {
        const newName = prompt('Enter new task name:', currentTaskItem.querySelector('strong').textContent);
        if (newName) {
            currentTaskItem.querySelector('strong').textContent = newName;
        }
    }

    function deleteTask() {
        moveToTrash(currentTaskItem);
    }

    function changeTask() {
        // For simplicity, we'll just change the priority here
        const newPriority = prompt('Enter new priority (Low, Medium, High):', 'Low');
        if (newPriority) {
            currentTaskItem.querySelector('span').textContent = ` [Priority: ${newPriority}]`;
        }
    }

    // The existing form submission logic
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const taskName = document.getElementById('task-name').value;
        const taskDate = document.getElementById('task-date').value;
        const taskPriority = document.getElementById('task-priority').value;

        const toDoItem = document.createElement('li');
        toDoItem.innerHTML = `
            <strong>${taskName}</strong> - ${taskDate} <span>[Priority: ${taskPriority}]</span>
        `;

        addDragAndDropHandlers(toDoItem);
        toDoList.appendChild(toDoItem);

        calendar.addEvent({
            title: taskName,
            start: taskDate,
            allDay: true,
            description: `Priority: ${taskPriority}`,
        });

        form.reset(); // Reset the form
    });

    // The existing moveToTrash function
    function moveToTrash(item) {
        // Remove from to-do list
        item.remove();

        // Create a trash item
        const trashItem = document.createElement('li');
        trashItem.innerHTML = item.innerHTML.replace('Delete', 'Restore');
        trashItem.querySelector('.delete-btn').className = 'restore-btn';

        // Add restore functionality
        trashItem.querySelector('.restore-btn').addEventListener('click', function () {
            restoreTask(trashItem, item.innerHTML);
        });

        // Append to Trash list
        trashList.appendChild(trashItem);
    }

    // Restore task from Trash
    function restoreTask(trashItem, taskContent) {
        trashItem.remove();

        const restoredItem = document.createElement('li');
        restoredItem.innerHTML = taskContent;
        restoredItem.draggable = true;

        // Add drag and drop handlers
        addDragAndDropHandlers(restoredItem);
        toDoList.appendChild(restoredItem);
    }

    // Add drag and drop functionality
    function addDragAndDropHandlers(item) {
        item.addEventListener('dragstart', function (e) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', this.innerHTML);
            this.classList.add('dragging');
        });

        item.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            this.classList.add('drag-over');
        });

        item.addEventListener('dragleave', function () {
            this.classList.remove('drag-over');
        });

        item.addEventListener('drop', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const draggedItemContent = e.dataTransfer.getData('text/plain');
            const currentItemContent = this.innerHTML;

            this.innerHTML = draggedItemContent;
            document.querySelector('.dragging').innerHTML = currentItemContent;

            document.querySelector('.dragging').classList.remove('dragging');
            this.classList.remove('drag-over');
        });

        item.addEventListener('dragend', function () {
            this.classList.remove('dragging');
        });
    }

    const existingItems = document.querySelectorAll('#to-do-list li');
    existingItems.forEach(item => addDragAndDropHandlers(item));
});


