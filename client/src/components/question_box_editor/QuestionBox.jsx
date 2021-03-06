import React from "react";
import AceEditor from "react-ace";
import { Button, Spinner } from "react-bootstrap";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";
import { useEffect, useState } from "react";
import { useTimer } from "use-timer";
import "./questionBox.css";
import { verifyUser } from "../../services/auth";
import { useHistory } from "react-router-dom";

export default function QuestionBox(props) {
  const [currentUser, setCurrentUser] = useState(null);
  let seconds = 45;
  const [begin, setBegin] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    answer: "",
    prompt: "",
    index: "",
  });
  const [continueGame, setContinueGame] = useState(true);
  const [win, setWin] = useState(false);
  let { questions, changeExplode } = props;

  const { time, start, pause, reset } = useTimer({
    initialTime: seconds,
    timerType: "DECREMENTAL",
    endTime: 0,
    onTimeOver: () => {
      failedGame();
    },
  });
  const history = useHistory();

  useEffect(() => {
    const handleVerify = async () => {
      const userData = await verifyUser();
      !userData && history.push("/login");
      setCurrentUser(userData);
    };
    handleVerify();
  }, []);

  ///////////////////////////////////////////
  ///// GAME LOGIC

  const startGame = () => {
    props.setSkyColor("#eb8643");
    setContinueGame(true);
    props.setLose(false);
    setBegin(true);
    nextQuestion(0);
    props.quickReset();
    props.totalTimeStart();
    changeExplode(false);
    setWin(false);
    props.setGameWon(false);
  };

  const nextQuestion = (index) => {
    setCurrentQuestion({
      question: questions[index].question,
      answer: questions[index].answer,
      prompt: questions[index].prompt,
      index: questions.indexOf(questions[index]),
    });
    startTimer();
  };

  const startTimer = () => {
    reset();
    start();
  };

  const userInput = (value) => {
    setCurrentQuestion({
      ...currentQuestion,
      question: value,
    });
  };

  const testAnswer = () => {
    console.log(eval(currentQuestion.question));
    let answer;
    try {
      answer = eval(currentQuestion.question);
    } catch (error) {
      failedGame();
    }
    try {
      answer.toString() === currentQuestion.answer ? nextRound() : failedGame();
    } catch (error) {
      failedGame();
    }
  };

  const nextRound = () => {
    if (currentQuestion.index >= 2) {
      props.setSkyColor("#7c4622");
    } else if (currentQuestion.index >= 4) {
      props.setSkyColor("#361f0f");
    } else if (currentQuestion.index >= 6) {
      props.setSkyColor("#160d06");
    }
    if (currentQuestion.index + 1 === questions.length) {
      playerWon();
    } else {
      nextQuestion(currentQuestion.index + 1);
      startTimer();
    }
  };

  const failedGame = () => {
    setContinueGame(false);
    changeExplode(true);
    props.setLose(true);
    props.totalTimePause();
  };

  const playerWon = () => {
    props.setGameWon(true);
    pause();
    props.totalTimePause();
    props.setSkyColor("#000");
    setWin(true);
    props.addUserScore(currentUser);
  };

  /////
  //////////////////////////////////////////

  return (
    <>
      <div className="question-box">
        <div className="editor">
          {!begin && (
            <>
              <div className="start-text-container">
                <p className="start-text">
                  You have crash landed on an alien planet! You have managed to
                  fix the ship and lift off, but the crash has caused the
                  software to malfunction! Type in the embedded code editor and
                  solve JavaScript based questions to gain altitude and escape
                  the global object!
                </p>
                <p className="start-text">
                  <strong>
                    You have 45 seconds to answer questions, if the time runs
                    out or you submit the wrong answer, the ship blows up! No
                    second chances here!
                  </strong>
                </p>
              </div>
              {!props.questions ? (
                <Spinner animation="border" />
              ) : (
                <Button variant="dark" onClick={startGame} size="lg">
                  Start
                </Button>
              )}
            </>
          )}

          {begin && continueGame && !win && (
            <>
              <div className="text-timer">
                <p className="question-text">
                  <strong>{currentQuestion.prompt}</strong>
                </p>
                <h3 className="timer">{`Time Left: ${time} Seconds`}</h3>
              </div>
              <AceEditor
                mode="javascript"
                onChange={userInput}
                value={currentQuestion.question}
                theme="monokai"
                name="editor"
                fontSize={14}
                height="80%"
                width="90%"
                showPrintMargin={true}
                showGutter={true}
                highlightActiveLine={true}
                setOptions={{
                  showLineNumbers: true,
                  tabSize: 2,
                  wrap: true,
                }}
              />
              <Button variant="dark" onClick={testAnswer}>
                Submit
              </Button>
            </>
          )}
          {!continueGame && (
            <>
              <h1 className="lose-title">You Lost!</h1>
              <p className="lose-text">Try Again!</p>
              <Button variant="dark" onClick={startGame} size="lg">
                Restart
              </Button>
            </>
          )}

          {win && (
            <>
              <h1 className="win-title">You Won!</h1>
              <p className="win-text">{`Total Time: ${props.totalTime}`}</p>
              <Button variant="dark" onClick={startGame} size="lg">
                Play Again
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
