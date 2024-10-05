let currentQuestionIndex = 0;
let currentCategory = 'html'; // Can be changed to other categories like css, javascript, etc.
let questions = [];


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
    const questionElement = document.getElementById('question');
    const optionLabels = [
        document.getElementById('label1'),
        document.getElementById('label2'),
        document.getElementById('label3'),
        document.getElementById('label4')
    ];


    const question = questions[currentQuestionIndex];
    questionElement.textContent = question.question;
    optionLabels.forEach((label, index) => {
        label.textContent = question.options[index];
    });

    const totalQuestions = questions.length;
    const questionCounter = document.getElementById('question-counter');
    questionCounter.innerText = `Question ${currentQuestionIndex + 1} of ${totalQuestions}`;
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
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            displayQuestions();
        } else {
            document.getElementById('message').textContent = 'Quiz completed!';
        }
    } else {
        document.getElementById('message').textContent = 'Incorrect, try again!';
    }
});

// Event handler for category selection
function selectCategory(category) {
    currentCategory = category;
    currentQuestionIndex = 0; // Reset question index when category changes
    loadQuestions(currentCategory);
}


// Load default category on page load
loadQuestions(currentCategory);