document.addEventListener('DOMContentLoaded', () => {
    // Initialize the app
    const app = new WorkoutTrackerApp();
    app.init();
});

class WorkoutTrackerApp {
    constructor() {
        // DOM Elements
        this.mainContent = document.getElementById('main-content');
        this.tabs = document.querySelectorAll('.tab');
        
        // Templates
        this.planTemplate = document.getElementById('plan-template');
        this.executeTemplate = document.getElementById('execute-template');
        this.historyTemplate = document.getElementById('history-template');
        this.progressTemplate = document.getElementById('progress-template');
        
        // State
        this.activeTab = 'plan';
        this.workouts = [];
        this.sessions = [];
        this.exerciseInputCounter = 0;
        
        // Bind methods
        this.handleTabClick = this.handleTabClick.bind(this);
        this.saveWorkout = this.saveWorkout.bind(this);
        this.addExerciseInput = this.addExerciseInput.bind(this);
        this.removeExerciseInput = this.removeExerciseInput.bind(this);
        this.loadWorkouts = this.loadWorkouts.bind(this);
        this.populateWorkoutSelect = this.populateWorkoutSelect.bind(this);
        this.handleWorkoutSelect = this.handleWorkoutSelect.bind(this);
        this.setupExecutionScreen = this.setupExecutionScreen.bind(this);
        this.handleExerciseCheck = this.handleExerciseCheck.bind(this);
        this.completeWorkout = this.completeWorkout.bind(this);
        this.loadHistory = this.loadHistory.bind(this);
        this.setupProgressScreen = this.setupProgressScreen.bind(this);
    }
    
    // Initialize the app
    init() {
        // Load data from localStorage
        this.loadData();
        
        // Set up event listeners for tabs
        this.tabs.forEach(tab => {
            tab.addEventListener('click', this.handleTabClick);
        });
        
        // Show the initial tab
        this.showTab(this.activeTab);
    }
    
    // Load data from localStorage
    loadData() {
        const workoutsData = localStorage.getItem('workouts');
        const sessionsData = localStorage.getItem('sessions');
        
        if (workoutsData) {
            this.workouts = JSON.parse(workoutsData);
        }
        
        if (sessionsData) {
            this.sessions = JSON.parse(sessionsData);
        }
    }
    
    // Save data to localStorage
    saveData() {
        localStorage.setItem('workouts', JSON.stringify(this.workouts));
        localStorage.setItem('sessions', JSON.stringify(this.sessions));
    }
    
    // Handle tab click
    handleTabClick(event) {
        const tab = event.currentTarget;
        const tabName = tab.dataset.tab;
        
        this.showTab(tabName);
    }
    
    // Show the selected tab
    showTab(tabName) {
        // Update active tab
        this.activeTab = tabName;
        
        // Update tab UI
        this.tabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Clear main content
        this.mainContent.innerHTML = '';
        
        // Show the appropriate screen based on the tab
        switch (tabName) {
            case 'plan':
                this.showPlanScreen();
                break;
            case 'execute':
                this.showExecuteScreen();
                break;
            case 'history':
                this.showHistoryScreen();
                break;
            case 'progress':
                this.showProgressScreen();
                break;
        }
    }
    
    // Plan Screen
    showPlanScreen() {
        // Clone the plan template
        const planScreen = this.planTemplate.content.cloneNode(true);
        
        // Add event listeners
        const workoutForm = planScreen.querySelector('#workout-form');
        const addExerciseBtn = planScreen.querySelector('#add-exercise-btn');
        
        workoutForm.addEventListener('submit', this.saveWorkout);
        addExerciseBtn.addEventListener('click', this.addExerciseInput);
        
        // Reset the exercise counter
        this.exerciseInputCounter = 0;
        
        // Add initial exercise input
        const exercisesContainer = planScreen.querySelector('#exercises-container');
        this.addExerciseInputToContainer(exercisesContainer);
        
        // Add the plan screen to the main content
        this.mainContent.appendChild(planScreen);
    }
    
    // Add exercise input to the form
    addExerciseInput() {
        const exercisesContainer = document.getElementById('exercises-container');
        this.addExerciseInputToContainer(exercisesContainer);
    }
    
    // Helper method to add exercise input
    addExerciseInputToContainer(container) {
        // Clone the exercise input template
        const exerciseInputTemplate = document.getElementById('exercise-input-template');
        const exerciseInput = exerciseInputTemplate.content.cloneNode(true);
        
        // Update IDs to make them unique
        const uniqueId = this.exerciseInputCounter++;
        
        const ids = ['muscle-group', 'exercise-name', 'exercise-type', 'target-sets', 'target-reps', 'target-weight'];
        ids.forEach(id => {
            const element = exerciseInput.querySelector(`#${id}`);
            element.id = `${id}-${uniqueId}`;
            
            const label = exerciseInput.querySelector(`label[for="${id}"]`);
            if (label) {
                label.setAttribute('for', `${id}-${uniqueId}`);
            }
        });
        
        // Add delete button event listener
        const deleteBtn = exerciseInput.querySelector('.delete-exercise-btn');
        deleteBtn.addEventListener('click', this.removeExerciseInput);
        
        // Add the exercise input to the container
        container.appendChild(exerciseInput);
    }
    
    // Remove exercise input
    removeExerciseInput(event) {
        const exerciseInput = event.target.closest('.exercise-input');
        exerciseInput.remove();
    }
    
    // Save a new workout
    saveWorkout(event) {
        event.preventDefault();
        
        const workoutNameInput = document.getElementById('workout-name');
        const workoutName = workoutNameInput.value.trim();
        
        if (!workoutName) {
            alert('Please enter a workout name');
            return;
        }
        
        const exerciseInputs = document.querySelectorAll('.exercise-input');
        
        if (exerciseInputs.length === 0) {
            alert('Please add at least one exercise');
            return;
        }
        
        const exercises = [];
        
        exerciseInputs.forEach(input => {
            const muscleGroupId = input.querySelector('[id^="muscle-group-"]').id;
            const exerciseNameId = input.querySelector('[id^="exercise-name-"]').id;
            const exerciseTypeId = input.querySelector('[id^="exercise-type-"]').id;
            const targetSetsId = input.querySelector('[id^="target-sets-"]').id;
            const targetRepsId = input.querySelector('[id^="target-reps-"]').id;
            const targetWeightId = input.querySelector('[id^="target-weight-"]').id;
            
            const muscleGroup = document.getElementById(muscleGroupId).value;
            const exerciseName = document.getElementById(exerciseNameId).value;
            const exerciseType = document.getElementById(exerciseTypeId).value;
            const targetSets = document.getElementById(targetSetsId).value;
            const targetReps = document.getElementById(targetRepsId).value;
            const targetWeight = document.getElementById(targetWeightId).value;
            
            if (!muscleGroup || !exerciseName || !exerciseType) {
                alert('Please fill out all exercise fields');
                return;
            }
            
            exercises.push({
                id: Date.now().toString() + Math.floor(Math.random() * 1000),
                muscleGroup,
                name: exerciseName,
                type: exerciseType,
                targetSets: parseInt(targetSets),
                targetReps: parseInt(targetReps),
                targetWeight: parseFloat(targetWeight)
            });
        });
        
        const workout = {
            id: Date.now().toString(),
            name: workoutName,
            exercises: exercises,
            createdAt: new Date().toISOString()
        };
        
        // Add the workout to the list
        this.workouts.push(workout);
        
        // Save to localStorage
        this.saveData();
        
        // Reset the form
        document.getElementById('workout-form').reset();
        document.getElementById('exercises-container').innerHTML = '';
        this.addExerciseInput();
        
        // Show a success message
        alert('Workout saved successfully!');
    }
    
    // Execute Screen
    showExecuteScreen() {
        // Clone the execute template
        const executeScreen = this.executeTemplate.content.cloneNode(true);
        
        // Add event listeners
        const workoutSelect = executeScreen.querySelector('#workout-select');
        workoutSelect.addEventListener('change', this.handleWorkoutSelect);
        
        const completeBtn = executeScreen.querySelector('#complete-workout-btn');
        completeBtn.addEventListener('click', this.completeWorkout);
        
        // Populate workout select
        this.populateWorkoutSelect(workoutSelect);
        
        // Add the execute screen to the main content
        this.mainContent.appendChild(executeScreen);
    }
    
    // Populate workout select dropdown
    populateWorkoutSelect(selectElement) {
        // Clear existing options except the first one
        const firstOption = selectElement.options[0];
        selectElement.innerHTML = '';
        selectElement.appendChild(firstOption);
        
        // Add workout options
        this.workouts.forEach(workout => {
            const option = document.createElement('option');
            option.value = workout.id;
            option.textContent = workout.name;
            selectElement.appendChild(option);
        });
    }
    
    // Handle workout selection
    handleWorkoutSelect(event) {
        const workoutId = event.target.value;
        
        if (!workoutId) {
            document.getElementById('execution-container').classList.add('hidden');
            return;
        }
        
        const workout = this.workouts.find(w => w.id === workoutId);
        
        if (workout) {
            this.setupExecutionScreen(workout);
        }
    }
    
    // Setup the execution screen for a selected workout
    setupExecutionScreen(workout) {
        const executionContainer = document.getElementById('execution-container');
        const workoutNameElement = document.getElementById('execution-workout-name');
        const exercisesContainer = document.getElementById('execution-exercises');
        const completeBtn = document.getElementById('complete-workout-btn');
        
        // Set workout name
        workoutNameElement.textContent = workout.name;
        
        // Clear exercises container
        exercisesContainer.innerHTML = '';
        
        // Add exercises
        workout.exercises.forEach((exercise, index) => {
            const exerciseTemplate = document.getElementById('exercise-execution-template');
            const exerciseElement = exerciseTemplate.content.cloneNode(true);
            
            // Update IDs and labels
            const checkbox = exerciseElement.querySelector('#exercise-check');
            checkbox.id = `exercise-check-${index}`;
            checkbox.dataset.exerciseId = exercise.id;
            
            const label = exerciseElement.querySelector('label');
            label.setAttribute('for', checkbox.id);
            
            // Set exercise details
            const nameElement = exerciseElement.querySelector('.exercise-name');
            const detailsElement = exerciseElement.querySelector('.exercise-details');
            
            nameElement.textContent = exercise.name;
            detailsElement.textContent = `${exercise.muscleGroup} · ${exercise.type} · ${exercise.targetSets} sets × ${exercise.targetReps} reps · ${exercise.targetWeight} lbs`;
            
            // Set default values for inputs
            const actualSets = exerciseElement.querySelector('.actual-sets');
            const actualReps = exerciseElement.querySelector('.actual-reps');
            const actualWeight = exerciseElement.querySelector('.actual-weight');
            
            actualSets.value = exercise.targetSets;
            actualReps.value = exercise.targetReps;
            actualWeight.value = exercise.targetWeight;
            
            // Add checkbox event listener
            checkbox.addEventListener('change', this.handleExerciseCheck);
            
            // Add the exercise to the container
            exercisesContainer.appendChild(exerciseElement);
        });
        
        // Reset complete button
        completeBtn.disabled = true;
        
        // Show the execution container
        executionContainer.classList.remove('hidden');
    }
    
    // Handle exercise checkbox change
    handleExerciseCheck() {
        const checkboxes = document.querySelectorAll('#execution-exercises input[type="checkbox"]');
        const completeBtn = document.getElementById('complete-workout-btn');
        
        // Check if all exercises are checked
        const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
        
        // Enable/disable complete button
        completeBtn.disabled = !allChecked;
    }
    
    // Complete the workout
    completeWorkout() {
        const workoutId = document.getElementById('workout-select').value;
        const workout = this.workouts.find(w => w.id === workoutId);
        
        if (!workout) {
            return;
        }
        
        const completedExercises = [];
        const checkboxes = document.querySelectorAll('#execution-exercises input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const exerciseId = checkbox.dataset.exerciseId;
                const exerciseItem = checkbox.closest('.exercise-execution-item');
                
                const actualSets = exerciseItem.querySelector('.actual-sets').value;
                const actualReps = exerciseItem.querySelector('.actual-reps').value;
                const actualWeight = exerciseItem.querySelector('.actual-weight').value;
                
                completedExercises.push({
                    exerciseId,
                    actualSets: parseInt(actualSets),
                    actualReps: parseInt(actualReps),
                    actualWeight: parseFloat(actualWeight)
                });
            }
        });
        
        // Create a new session
        const session = {
            id: Date.now().toString(),
            workoutId: workout.id,
            workoutName: workout.name,
            completedExercises,
            completedAt: new Date().toISOString()
        };
        
        // Add the session to the list
        this.sessions.push(session);
        
        // Save to localStorage
        this.saveData();
        
        // Reset the execution screen
        document.getElementById('workout-select').value = '';
        document.getElementById('execution-container').classList.add('hidden');
        
        // Show a success message
        alert('Workout completed successfully!');
    }
    
    // History Screen
    showHistoryScreen() {
        // Clone the history template
        const historyScreen = this.historyTemplate.content.cloneNode(true);
        
        // Add the history screen to the main content
        this.mainContent.appendChild(historyScreen);
        
        // Load history data
        this.loadHistory();
    }
    
    // Load workout history
    loadHistory() {
        const historyList = document.getElementById('history-list');
        
        if (this.sessions.length === 0) {
            historyList.innerHTML = '<p>No completed workouts yet.</p>';
            return;
        }
        
        // Sort sessions by date (newest first)
        const sortedSessions = [...this.sessions].sort((a, b) => {
            return new Date(b.completedAt) - new Date(a.completedAt);
        });
        
        // Clear history list
        historyList.innerHTML = '';
        
        // Add session items
        sortedSessions.forEach(session => {
            const sessionDate = new Date(session.completedAt);
            const formattedDate = `${sessionDate.toLocaleDateString()} at ${sessionDate.toLocaleTimeString()}`;
            
            const sessionItem = document.createElement('div');
            sessionItem.className = 'history-item';
            
            // Create session content
            sessionItem.innerHTML = `
                <div class="history-date">${formattedDate}</div>
                <div class="history-workout-name">${session.workoutName}</div>
                <div class="history-exercise-count">${session.completedExercises.length} exercises completed</div>
            `;
            
            // Add click event to show details
            sessionItem.addEventListener('click', () => {
                this.showSessionDetails(session);
            });
            
            // Add the session item to the history list
            historyList.appendChild(sessionItem);
        });
    }
    
    // Show session details
    showSessionDetails(session) {
        // Find the workout
        const workout = this.workouts.find(w => w.id === session.workoutId);
        
        if (!workout) {
            alert('Workout details not found.');
            return;
        }
        
        let detailsMessage = `Workout: ${session.workoutName}\n`;
        detailsMessage += `Date: ${new Date(session.completedAt).toLocaleString()}\n\n`;
        detailsMessage += `Exercises:\n`;
        
        session.completedExercises.forEach(completedExercise => {
            const exercise = workout.exercises.find(e => e.id === completedExercise.exerciseId);
            
            if (exercise) {
                detailsMessage += `- ${exercise.name}: ${completedExercise.actualSets} sets × ${completedExercise.actualReps} reps × ${completedExercise.actualWeight} lbs\n`;
            }
        });
        
        alert(detailsMessage);
    }
    
    // Progress Screen
    showProgressScreen() {
        // Clone the progress template
        const progressScreen = this.progressTemplate.content.cloneNode(true);
        
        // Add the progress screen to the main content
        this.mainContent.appendChild(progressScreen);
        
        // Setup progress screen
        this.setupProgressScreen();
    }
    
    // Setup progress screen
    setupProgressScreen() {
        // Get all unique exercises from all workouts
        const allExercises = new Map();
        
        this.workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                if (!allExercises.has(exercise.name)) {
                    allExercises.set(exercise.name, {
                        id: exercise.id,
                        name: exercise.name,
                        muscleGroup: exercise.muscleGroup,
                        type: exercise.type
                    });
                }
            });
        });
        
        // Populate exercise select
        const exerciseSelect = document.getElementById('exercise-progress-select');
        
        // Clear existing options except the first one
        const firstOption = exerciseSelect.options[0];
        exerciseSelect.innerHTML = '';
        exerciseSelect.appendChild(firstOption);
        
        // Add exercise options
        Array.from(allExercises.values()).sort((a, b) => a.name.localeCompare(b.name)).forEach(exercise => {
            const option = document.createElement('option');
            option.value = exercise.name;
            option.textContent = exercise.name;
            exerciseSelect.appendChild(option);
        });
        
        // Add event listener for exercise selection
        exerciseSelect.addEventListener('change', (event) => {
            const exerciseName = event.target.value;
            
            if (!exerciseName) {
                document.getElementById('progress-chart-container').classList.add('hidden');
                return;
            }
            
            this.showExerciseProgress(exerciseName);
        });
    }
    
    // Show progress for a specific exercise
    showExerciseProgress(exerciseName) {
        const progressContainer = document.getElementById('progress-chart-container');
        const exerciseNameElement = document.getElementById('progress-exercise-name');
        const progressData = document.getElementById('progress-data');
        
        // Set exercise name
        exerciseNameElement.textContent = exerciseName;
        
        // Clear progress data
        progressData.innerHTML = '';
        
        // Find all sessions with this exercise
        const exerciseData = [];
        
        this.sessions.forEach(session => {
            // Find the workout
            const workout = this.workouts.find(w => w.id === session.workoutId);
            
            if (!workout) {
                return;
            }
            
            // Find the completed exercise
            session.completedExercises.forEach(completedExercise => {
                const exercise = workout.exercises.find(e => e.id === completedExercise.exerciseId);
                
                if (exercise && exercise.name === exerciseName) {
                    exerciseData.push({
                        date: new Date(session.completedAt),
                        workoutName: session.workoutName,
                        sets: completedExercise.actualSets,
                        reps: completedExercise.actualReps,
                        weight: completedExercise.actualWeight
                    });
                }
            });
        });
        
        // Sort by date (newest first)
        exerciseData.sort((a, b) => b.date - a.date);
        
        if (exerciseData.length === 0) {
            progressData.innerHTML = '<p>No data available for this exercise.</p>';
        } else {
            // Display exercise progress
            exerciseData.forEach(data => {
                const formattedDate = `${data.date.toLocaleDateString()}`;
                
                const dataItem = document.createElement('div');
                dataItem.className = 'progress-data-item';
                
                dataItem.innerHTML = `
                    <div class="progress-date">${formattedDate} - ${data.workoutName}</div>
                    <div class="progress-metrics">${data.sets} sets × ${data.reps} reps × ${data.weight} lbs</div>
                `;
                
                progressData.appendChild(dataItem);
            });
        }
        
        // Show the progress container
        progressContainer.classList.remove('hidden');
    }
}
