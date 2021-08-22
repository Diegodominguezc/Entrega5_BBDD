
const {User, Quiz, Score} = require("./model.js").models;
const {Sequelize, Error} = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');
// Show all quizzes in DB including <id> and <author>
exports.list = async (rl) =>  {

  let quizzes = await Quiz.findAll(
    { include: [{
        model: User,
        as: 'author'
      }]
    }
  );
  quizzes.forEach( 
    q => rl.log(`  "${q.question}" (by ${q.author.name}, id=${q.id})`)
  );
}

// Create quiz with <question> and <answer> in the DB
exports.create = async (rl) => {

  let name = await rl.questionP("Enter user");
    let user = await User.findOne({where: {name}});
    if (!user) throw new Error(`User ('${name}') doesn't exist!`);

    let question = await rl.questionP("Enter question");
    if (!question) throw new Error("Response can't be empty!");

    let answer = await rl.questionP("Enter answer");
    if (!answer) throw new Error("Response can't be empty!");

    await Quiz.create( 
      { question,
        answer, 
        authorId: user.id
      }
    );
    rl.log(`   User ${name} creates quiz: ${question} -> ${answer}`);
}

// Test (play) quiz identified by <id>
exports.test = async (rl) => {

  let id = await rl.questionP("Enter quiz Id");
  let quiz = await Quiz.findByPk(Number(id));
  if (!quiz) throw new Error(`  Quiz '${id}' is not in DB`);

  let answered = await rl.questionP(quiz.question);

  if (answered.toLowerCase().trim()===quiz.answer.toLowerCase().trim()) {
    rl.log(`  The answer "${answered}" is right!`);
  } else {
    rl.log(`  The answer "${answered}" is wrong!`);
  }
}

// Update quiz (identified by <id>) in the DB
exports.update = async (rl) => {

  let id = await rl.questionP("Enter quizId");
  let quiz = await Quiz.findByPk(Number(id));

  let question = await rl.questionP(`Enter question (${quiz.question})`);
  if (!question) throw new Error("Response can't be empty!");

  let answer = await rl.questionP(`Enter answer (${quiz.answer})`);
  if (!answer) throw new Error("Response can't be empty!");

  quiz.question = question;
  quiz.answer = answer;
  await quiz.save({fields: ["question", "answer"]});

  rl.log(`  Quiz ${id} updated to: ${question} -> ${answer}`);
}

// Delete quiz & favourites (with relation: onDelete: 'cascade')
exports.delete = async (rl) => {

  let id = await rl.questionP("Enter quiz Id");
  let n = await Quiz.destroy({where: {id}});
  
  if (n===0) throw new Error(`  ${id} not in DB`);
  rl.log(`  ${id} deleted from DB`);
}

//PLAY


exports.play = async(rl) =>{
  let x=0;
  let numero= await Quiz.count();
  //necesito require sequelize
  let array= await Quiz.findAll({order: sequelize.random()});
  //Como array de [0] a [numero-1]
  for(i=0; i<numero; i++){
    let answered = await rl.questionP(array[i].question);
    //Queremos min=1 y max=La cuenta de quiz
   /* let min=1;
    let id= Math.floor((Math.random()*numero)+min);
    let quiz= await Quiz.findByPk(Number(id));

    let answered = await rl.questionP(quiz.question);*/
    if (answered.toLowerCase().trim()===array[i].answer.toLowerCase().trim()) {
      rl.log(`  The answer "${answered}" is right!`);
      x++;
    } else {
      rl.log(`  The answer "${answered}" is wrong!`);
      break;
    }
  }
  rl.log(`   Score: "${x}"`);
  let name= await rl.questionP("Enter your name");
  if(!name) throw new Error('Response cant be empty');
  let user = await User.findOne({where: {name}});
  if (!user){
    user= await User.create({
      name: name,
      age:0
    });

  }
  //cogemos el user(ahora si no estaba creado ya está creado)
  user=await User.findOne({where: {name}});
  await Score.create({
    wins: x,
    userId: user.id
  });

}
exports.list_score = async(rl) =>{
  let array = await Score.findAll({
    include: [{model: User, as: "author"}],
    order:[['wins', 'DESC']]});
  array.forEach(q=>rl.log(`${q.author.name}|${q.wins}|${new Date().toUTCString()}`))

} 