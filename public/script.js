let currentQuestionIndex = 0;
let currentCategory = 'html'; // Can be changed to other categories like css, javascript, etc.
let questions = [];
let attemptCounter = [];
let numberOfAttempts = 0;

const quizContainerElem = document.getElementById('quiz-container');
const resultsContainerElem = document.getElementById('results-container');

// Function to load questions for the selected category
async function loadQuestions(category) {
    try {
        const response = await fetch(`/questions?category=${category}`);
        if (!response.ok) throw new Error('Failed to load questions');
        questions = await response.json();
        displayQuestions();
    } catch (error) {
        console.error('Error:', error);
    }
}


function displayQuestions() {
    quizContainerElem.style.display = 'block';
    resultsContainerElem.style.display = 'none';
    numberOfAttempts = 0;

    const questionElement = document.getElementById('question');
    const optionRadios = document.querySelectorAll('input[name="option"]');

    const optionLabels = [
        document.getElementById('label1'),
        document.getElementById('label2'),
        document.getElementById('label3'),
        document.getElementById('label4')
    ];


    const question = questions[currentQuestionIndex];
    questionElement.textContent = question.question;

    //reset radio Buttons
    optionRadios.forEach((radio, index) => {
        radio["checked"] = false;
    });

    optionLabels.forEach((label, index) => {
        label.textContent = question.options[index];
    });

    const totalQuestions = questions.length;
    const questionCounter = document.getElementById('question-counter');
    questionCounter.innerText = `Question ${currentQuestionIndex + 1} of ${totalQuestions}`;

    displayAttempts();
}

function displayAttempts() {
    const attemptCounter = document.getElementById('attempt-counter');
    attemptCounter.innerText = `Attempts : ${numberOfAttempts}`;
}

function displayResults() {
    quizContainerElem.style.display = 'none';
    resultsContainerElem.style.display = 'block';

    // Get the tbody element
    const tbody = document.getElementById('results-body');

    // Clear any existing rows in the tbody (in case you want to repopulate)
    tbody.innerHTML = '';

    // Iterate over attemptCounter array and create table rows
    attemptCounter.forEach(attempt => {
        // Create a new row
        const row = document.createElement('tr');

        // Create and populate cells for Question No. and Number Of Attempts
        const questionCell = document.createElement('td');
        questionCell.textContent = attempt.questionNumber;

        const attemptsCell = document.createElement('td');
        attemptsCell.textContent = attempt.numberOfAttempts;

        // Append the cells to the row
        row.appendChild(questionCell);
        row.appendChild(attemptsCell);

        // Append the row to the tbody
        tbody.appendChild(row);
    });
}


document.getElementById('quiz-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const selectedOption = document.querySelector('input[name="option"]:checked');

    if (!selectedOption) {
        alert('Please select an answer');
        return;
    }


    const userAnswer = parseInt(selectedOption.value);
    const correctAnswer = questions[currentQuestionIndex].correct;


    if (userAnswer === correctAnswer) {
        document.getElementById('message').textContent = 'Correct! Moving to next question.';
        let obj = { questionNumber: currentQuestionIndex + 1, numberOfAttempts: numberOfAttempts }
        attemptCounter.push(obj);
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            displayQuestions();
        } else {
            displayResults();
            document.getElementById('message').textContent = 'Quiz completed!';
        }
    } else {
        numberOfAttempts++;
        displayAttempts();
        document.getElementById('message').textContent = 'Incorrect, try again!';
    }
});

// Event handler for category selection
function selectCategory(category) {
    currentCategory = category;
    currentQuestionIndex = 0; // Reset question index when category changes
    attemptCounter = [];
    loadQuestions(currentCategory);
}


// Load default category on page load
loadQuestions(currentCategory);