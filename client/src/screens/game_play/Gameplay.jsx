import React from "react";
import QuestionBox from "../../components/question_box_editor/QuestionBox";
import { useTimer } from "use-timer";
import "./gameplay.css";

export default function Gameplay(props) {
  const { time, start, pause, reset, isRunning } = useTimer({
    initialTime: 0,
  });

  const { questions } = props;

  return (
    <div className="gameplay">
      <div className="animation"></div>

      <div className="questions">
        <QuestionBox
          questions={questions}
          totalTime={time}
          totalTimeStart={start}
          totalTimePause={pause}
        />
      </div>
    </div>
  );
}
