let currentQuestionIndex = 0;
let currentCategory = 'html'; // Can be changed to other categories like css, javascript, etc.
let questions = [];


// Fetch questions from the server
fetch('/questions')
    .then(response => response.json())
    .then(data => {
        questions = data[currentCategory];
        loadQuestion();
    });


function loadQuestion() {
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
            loadQuestion();
        } else {
            document.getElementById('message').textContent = 'Quiz completed!';
        }
    } else {
        document.getElementById('message').textContent = 'Incorrect, try again!';
    }
});
