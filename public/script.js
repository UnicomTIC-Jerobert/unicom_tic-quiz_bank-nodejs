let currentQuestionIndex = 0;
let currentCategory = 'html'; // Can be changed to other categories like css, javascript, etc.
let question = {};
let attemptCounter = [];
let numberOfAttempts = 0;

const quizContainerElem = document.getElementById('quiz-container');
const resultsContainerElem = document.getElementById('results-container');


// Function to load a single question
async function loadQuestion(category, questionIndex) {
    try {
        const response = await fetch(`/questions?category=${category}&index=${questionIndex}`);
        if (!response.ok) throw new Error('Failed to load question');
        question = await response.json();
        console.log(question)
        displayQuestion(question);
    } catch (error) {
        console.error('Error:', error);
    }
}


function displayQuestion() {
    if (currentQuestionIndex < question.total) {
        quizContainerElem.style.display = 'block';
        resultsContainerElem.style.display = 'none';
        numberOfAttempts = 0;

        const questionElement = document.getElementById('question');
        const optionRadios = document.querySelectorAll('input[name="option"]');
        document.getElementById('message').textContent = "";

        const optionLabels = [
            document.getElementById('label1'),
            document.getElementById('label2'),
            document.getElementById('label3'),
            document.getElementById('label4')
        ];

        questionElement.textContent = question.question;

        //reset radio Buttons
        optionRadios.forEach((radio, index) => {
            radio["checked"] = false;
        });

        optionLabels.forEach((label, index) => {
            label.textContent = question.options[index];
        });

        const totalQuestions = question.total;
        const questionCounter = document.getElementById('question-counter');
        questionCounter.innerText = `Question ${currentQuestionIndex + 1} of ${totalQuestions}`;


        displayAttempts();
    } else {
        displayResults()
    }
}

function displayAttempts() {
    const attemptCounter = document.getElementById('attempt-counter');
    attemptCounter.innerText = `Attempts : ${numberOfAttempts}`;
}

async function displayResults() {
    quizContainerElem.style.display = 'none';
    resultsContainerElem.style.display = 'block';

    // Fetch attempt data by category
    const attempts = await fetchAttemptsByCategory(currentCategory);

    // Get the tbody element
    const tbody = document.getElementById('results-body');

    // Clear any existing rows in the tbody (in case you want to repopulate)
    tbody.innerHTML = '';

    // Iterate over attemptCounter array and create table rows
    attempts.forEach(attempt => {
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

    // Send request to the server to verify answer
    checkAnswer(userAnswer);
});

async function checkAnswer(userAnswer) {
    try {

        if (question.correct == userAnswer) {
            // organizing attempt data for sent to server
            let attemptData = {
                questionNumber: currentQuestionIndex + 1,
                numberOfAttempts: numberOfAttempts,
                category: currentCategory,
                timestamp: new Date().toISOString()
            };

            // Send the attempt data to the server
            await saveAttemptData(attemptData);

            // Move to the next question
            currentQuestionIndex++;
            loadQuestion(currentCategory, currentQuestionIndex);
            document.getElementById('message').textContent = '';
        } else {
            numberOfAttempts++;
            displayAttempts();
            document.getElementById('message').textContent = 'Incorrect, try again!';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to fetch attempts from the server
async function fetchAttemptsByCategory(category) {
    try {
        const response = await fetch(`/attempts?category=${category}`);
        if (!response.ok) {
            throw new Error('Failed to fetch attempts data');
        }
        return await response.json();  // Return parsed JSON data
    } catch (error) {
        console.error('Error fetching attempts:', error);
        return [];  // Return empty array in case of an error
    }
}

async function saveAttemptData(attemptData) {
    try {
        const response = await fetch('/save-attempt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(attemptData)
        });

        if (!response.ok) {
            throw new Error('Failed to save attempt data.');
        }

        const result = await response.json();
        console.log(result.message); // Optional: Log the success message
    } catch (error) {
        console.error('Error saving attempt data:', error);
    }
}

// Event handler for category selection
function selectCategory(category) {
    currentCategory = category;
    currentQuestionIndex = 0; // Reset question index when category changes
    attemptCounter = [];
    loadQuestion(currentCategory, currentQuestionIndex);
}

// Load the first question on page load
loadQuestion(currentCategory, currentQuestionIndex);