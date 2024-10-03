document.addEventListener('DOMContentLoaded', function () {
    const toDoLink = document.getElementById('to-do-link');
    const calendarLink = document.getElementById('calendar-link');
    const toDoPage = document.getElementById('to-do-list-page');
    const calendarPage = document.getElementById('calendar-page');
    const form = document.getElementById('schedule-form');
    const toDoList = document.getElementById('to-do-list');

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
        events: [] // Placeholder for events, can integrate with Google Calendar API
    });
    calendar.render();


    // Default view: To-Do List page
    toDoPage.classList.add('active');

    // Switch between views
    toDoLink.addEventListener('click', function () {
        toDoPage.classList.add('active');
        calendarPage.classList.remove('active');
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
        const taskTime = document.getElementById('task-time').value;
        const taskPriority = document.getElementById('task-priority').value;

        // Create a new task element
        const toDoItem = document.createElement('li');
        toDoItem.draggable = true;  // Make the item draggable
        toDoItem.innerHTML = `<strong>${taskName}</strong> - ${taskDate} at ${taskTime} [Priority: ${taskPriority}]`;

        // Add drag event listeners to the task item
        addDragAndDropHandlers(toDoItem);

        // Append the new task to the to-do list
        toDoList.appendChild(toDoItem);

        // Clear the form fields after adding the task
        form.reset();
    });

    // Add drag-and-drop functionality to each task
    function addDragAndDropHandlers(item) {
        item.addEventListener('dragstart', function (e) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', this.innerHTML);  // Store the dragged item's content
            this.classList.add('dragging');
        });

        item.addEventListener('dragover', function (e) {
            e.preventDefault();  // Necessary for allowing the drop
            e.dataTransfer.dropEffect = 'move';
            this.classList.add('drag-over');  // Style for indication
        });

        item.addEventListener('dragleave', function () {
            this.classList.remove('drag-over');
        });

        item.addEventListener('drop', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const draggedItemContent = e.dataTransfer.getData('text/plain');
            const currentItemContent = this.innerHTML;

            // Swap the contents of the dragged item and the dropped target
            this.innerHTML = draggedItemContent;
            document.querySelector('.dragging').innerHTML = currentItemContent;

            // Clean up the dragging class
            document.querySelector('.dragging').classList.remove('dragging');
            this.classList.remove('drag-over');
        });

        item.addEventListener('dragend', function () {
            this.classList.remove('dragging');
        });
    }

    // Add drag-and-drop functionality to existing items
    const existingItems = document.querySelectorAll('#to-do-list li');
    existingItems.forEach(item => addDragAndDropHandlers(item));
});
