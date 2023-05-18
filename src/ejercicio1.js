const express = require('express');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const app = express();
const port = 3000;

// Variable en la que almacenaremos los exámenes
let exams = [];

// Motor de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware formularios
app.use(express.urlencoded({ extended: true }));

// Middleware archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta raíz - Preguntar número de preguntas
app.get('/', (req, res) => {
  res.render('index', { exams });
});

// Ruta para crear el examen
app.post('/create', (req, res) => {
  const numQuestions = parseInt(req.body.numQuestions);
  res.render('create', { numQuestions });
});

// Ruta para guardar el examen
app.post('/generate', (req, res) => {
  const exam = {
    id: exams.length + 1,
    questions: [],
  };

  const numQuestions = parseInt(req.body.numQuestions);

  for (let i = 1; i <= numQuestions; i++) {
    const score = req.body[`score${i}`];
    const description = req.body[`description${i}`];
    const question = { score, description };
    exam.questions.push(question);
  }

  exams.push(exam); // Guardamos el examen en el array

  res.redirect('/');
});


// Ruta para ver un examen
app.get('/exam/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const exam = exams.find((e) => e.id === id);

  if (exam) {
    res.render('exam', { exam });
  } else {
    res.status(404).render('404');
  }
});

// Generar PDF del examen
app.get('/exam/:id/pdf', (req, res) => {
  const id = parseInt(req.params.id);
  const exam = exams.find((e) => e.id === id);
  console.log(exam)

  if (exam) {
    const doc = new PDFDocument();

    doc.fontSize(20).text(`Examen ${exam.id}`, { align: 'center' }).moveDown(0.5);

    exam.questions.forEach((question, index) => {
      doc.fontSize(14).fillColor('blue').text(`Pregunta ${index + 1}:`, { continued: true }).fillColor('black').text(question.description).moveDown(0.5);
      doc.fontSize(12).fillColor('black').text(`Puntuación: ${question.score}`).moveDown();
    });

    const filename = `exam_${new Date().toJSON().slice(0, 10)}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    doc.pipe(res);
    doc.end();
  } else {
    res.status(404).render('404');
  }
});

// Manejo del about
app.get('/about', (req, res) => {
  res.render('about');
});

// Manejo estático de 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Iniciar el servidor
app.listen(port, () => {
  console.log('El servidor se encuentra en funcionamiento');
});
