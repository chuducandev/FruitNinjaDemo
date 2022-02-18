import React, { useRef, useState } from "react";
import { StatusBar, Dimensions, Text, Animated, Easing } from "react-native";
import { GameEngine } from "react-native-game-engine";
import {
  Physics,
  CreateBox,
  MoveBox,
  CleanBoxes,
  ControlComboTextOpacity,
  ControlSplashOpacity,
  RestartGame,
} from "./systems";
import { Box, ComboText } from "./renderers";
import Matter from "matter-js";
import LottieView from 'lottie-react-native';
import AnimatedLottieView from "lottie-react-native";
import { starInterval } from "./constants";

Matter.Common.isElement = () => false; //-- Overriding this function because the original references HTMLElement

const { width, height } = Dimensions.get("window");

const App = () => {
  const [score, setScore] = useState(0);
  const [scoreColor, setScoreColor] = useState("#d02023");
  const [isExploding, setIsExploding] = useState(false);
  const [comboTextParams, setComboTextParams] = useState({
    numOfCombo: 0,
    color: "pink",
    x: -1000,
    y: -1000,
    startingTime: (new Date()).getTime(),
    opacity: 1,
  })
  const gameEngine = useRef();
  const explosionRef = useRef();
  const explosionOpacity = useRef(new Animated.Value(1)).current;

  function explode() {
    console.log("exploding");
    setIsExploding(true);
    explosionRef.current.play();
    setTimeout(() => {
      setIsExploding(false);
      // Animated.timing(explosionOpacity, {
      //   toValue: 0,
      //   duration: 500,
      //   useNativeDriver: false,
      //   easing: Easing.ease,
      // }).start(() => {
      //   setIsExploding(false);
      //   explosionOpacity.setValue(1);
      // })
    }, 4000)
  }

  const engine = Matter.Engine.create({ enableSleeping: false, gravity: { x: 0, y: 2 } });
  const world = engine.world;

  const constraint = Matter.Constraint.create({
    label: "Drag Constraint",
    pointA: { x: 0, y: 0 },
    pointB: { x: 0, y: 0 },
    length: 0.01,
    stiffness: 0.1,
    angularStiffness: 1,
  });

  Matter.World.addConstraint(world, constraint);

  return (
    <GameEngine
      ref={gameEngine}
      systems={[
        Physics,
        CreateBox,
        MoveBox,
        CleanBoxes,
        ControlComboTextOpacity,
        ControlSplashOpacity,
        RestartGame,
      ]}
      entities={{
        global: {
          setScore,
          setScoreColor,
          setComboTextParams,
          explode,
          comboText: {
            position: {
              x: -1000,
              y: -1000,
            }
          },
          currentCombo: 0,
          startingTime: (new Date()).getTime(),
          followingTime: (new Date()).getTime(),
          endingTime: (new Date()).getTime() + 180000,
          starTime: (new Date()).getTime() - starInterval,
          previousSliceTime: 0,
        },
        physics: {
          engine: engine,
          world: world,
          constraint: constraint,
          constraints: [],
        },
      }}
    >
      <StatusBar hidden={true} />
      <Text
        style={{
          position: "absolute",
          top: height / 7,
          alignSelf: "center",
          fontSize: height / 10,
          fontWeight: "bold",
          color: scoreColor,
        }}
      >
        {score}
      </Text>
      <ComboText
        {...comboTextParams}
      />
      {isExploding && <AnimatedLottieView
        ref={explosionRef}
        source={require("./assets/animations/bomb-explosion.json")}
        loop={false}
        style={[{
          width: width,
          height: height,
          marginLeft: -(height - width) / 4,
          marginLeft: -75,
          resizeMode: "cover",
        }, {
          opacity: 1,
        }]}
      />}
    </GameEngine>
  );
};

export default App;
