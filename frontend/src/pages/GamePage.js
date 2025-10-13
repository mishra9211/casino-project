import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Loader.css"; // 👈 CSS for loader

// 🔹 Import all your LiveCasino game components
import HiLoGame from "../LiveCasino/HiLoGame";
import AndarBaharGame from "../LiveCasino/AndarBaharGame";
import VBollywoodGame from "../LiveCasino/VBollywoodGame";
import DragonTiger from "../LiveCasino/DragonTiger";
import Bacarrat from "../LiveCasino/Bacarrat";
import SicBo from "../LiveCasino/SicBo";
import Roulette from "../LiveCasino/Roulette";
import Poker2020 from "../LiveCasino/Poker2020";
import Lucky7 from "../LiveCasino/Lucky7";
import TeenpattiOneDay from "../LiveCasino/TeenpattiOneDay";
import ThirtyTwoCards from "../LiveCasino/32Cards";
import DTL from "../LiveCasino/DTL";
import AmarAkbarAnthony from "../LiveCasino/AmarAkbarAnthony";
import ThreeCardsJudgement from "../LiveCasino/3CardsJudgement";
import QueenRace from "../LiveCasino/QueenRace";
import Race20 from "../LiveCasino/Race20";
import CasinoWar from "../LiveCasino/CasinoWar";
import WorliMatka from "../LiveCasino/WorliMatka";
import Lottery from "../LiveCasino/Lottery";
import TestTeenpatti from "../LiveCasino/TestTeenpatti";
import Trio from "../LiveCasino/Trio";
import Baccarat29 from "../LiveCasino/29Baccarat";
import TwoCardTeenpatti from "../LiveCasino/TwoCardTeenpatti";
import MuflisTeenpatti from "../LiveCasino/MuflisTeenpatti";
import Poker1Day from "../LiveCasino/Poker1-Day";
import TwentyTwentyTeenPatti from "../LiveCasino/20-20Teenpatti";
import FiveCricket from "../LiveCasino/5FiveCricket";
import OneDayDragonTiger from "../LiveCasino/1DayDragonTiger";
import DusKaDum from "../LiveCasino/DusKaDum";
import OneCard2020 from "../LiveCasino/OneCard2020";
import OneCardMeter from "../LiveCasino/OneCardMeter";
import OneCardOneDay from "../LiveCasino/OneCardOneDay";
import SixPlayerPoker from "../LiveCasino/6PlayerPoker";
import Instant2CardsTeenpatti from "../LiveCasino/Instant2CardsTeenpatti";
import Raceto17 from "../LiveCasino/Raceto17";
import NoteNumber from "../LiveCasino/NoteNumber";
import CricketMatch2020 from "../LiveCasino/CricketMatch2020";
import Raceto2nd from "../LiveCasino/Raceto2nd";
import OpenTeenpatti from "../LiveCasino/OpenTeenpatti";
import CenterCardOneDay from "../LiveCasino/CenterCardOneDay";
import HighLow from "../LiveCasino/HighLow";
import BaccaratOneDay from "../LiveCasino/BaccaratOneDay";
import TenTenCricket from "../LiveCasino/10-10cricket";
import Instantworli from "../LiveCasino/Instantworli";
import InstantTeenPatti from "../LiveCasino/InstantTeenPatti";
import AndarBahar50 from "../LiveCasino/AndarBahar50";
import SuperOver from "../LiveCasino/SuperOver";
import CenterCard from "../LiveCasino/Centercard";
import FootballStudIo from "../LiveCasino/FootballStudIo";
import DreamWheel from "../LiveCasino/DreamWheel";
import TwentyTwentyTeenpatti2 from "../LiveCasino/2020Teenpatti2";
import DragonTiger2 from "../LiveCasino/DragonTiger2";
import Lucky5 from "../LiveCasino/Lucky5";
import AK47Teenpatti from "../LiveCasino/AK47Teenpatti";
import TeenpattiJoker20_20 from "../LiveCasino/TeenpattiJoker20-20";
import TurboAutoRoulette from "../LiveCasino/TurboAutoRoulette";
import SpeedAutoRoulette from "../LiveCasino/SpeedAutoRoulette";


// 🔹 Map of games
const gameMap = {
  hilo: HiLoGame,
  andarbahar: AndarBaharGame,
  vbollywood: VBollywoodGame,
  dragontiger: DragonTiger,
  bacarrat: Bacarrat,
  sicbo: SicBo,
  roulette: Roulette,
  poker2020: Poker2020,
  lucky7: Lucky7,
  teenpattioneday: TeenpattiOneDay,
  "32cards": ThirtyTwoCards,
  dtl: DTL,
  amarakbaranthony: AmarAkbarAnthony,
  "3cardsjudgement": ThreeCardsJudgement,
  queenrace: QueenRace,
  race20: Race20,
  casinowar: CasinoWar,
  worlimatka: WorliMatka,
  lottery: Lottery,
  testteenpatti: TestTeenpatti,
  trio: Trio,
  "29baccarat": Baccarat29,
  twocardteenpatti: TwoCardTeenpatti,
  muflisteenpatti: MuflisTeenpatti,
  poker1day: Poker1Day,
  "2020teenpatti": TwentyTwentyTeenPatti,
  "5fivecricket": FiveCricket,
  "1daydragontiger": OneDayDragonTiger,
  duskadum: DusKaDum,
  onecard2020: OneCard2020,
  onecardmeter: OneCardMeter,
  onecardoneday: OneCardOneDay,
  "6playerpoker": SixPlayerPoker,
  instant2cardsteenpatti: Instant2CardsTeenpatti,
  raceto17: Raceto17,
  notenumber: NoteNumber,
  cricketmatch2020: CricketMatch2020,
  raceto2nd: Raceto2nd,
  openteenpatti: OpenTeenpatti,
  centercardoneday: CenterCardOneDay,
  highlow: HighLow,
  baccaratoneday: BaccaratOneDay,
  "10-10cricket": TenTenCricket,
  instantworli: Instantworli,
  instantteenpatti: InstantTeenPatti,
  andarbahar50: AndarBahar50,
  superover: SuperOver,
  centercard: CenterCard,
  footballstudio: FootballStudIo,
  dreamwheel: DreamWheel,
  "2020teenpatti2": TwentyTwentyTeenpatti2,
  dragontiger2: DragonTiger2,
  lucky5: Lucky5,
  ak47teenpatti: AK47Teenpatti,
  "teenpattijoker20-20": TeenpattiJoker20_20,
  turboautoroulette: TurboAutoRoulette,
  speedautoroulette: SpeedAutoRoulette,
};

// 🔹 Main Component
export default function GamePage() {
  const { gameName } = useParams();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0); // progress 0 - 100

  const GameComponent = gameMap[gameName?.toLowerCase()];

  useEffect(() => {
    if (!GameComponent) return;

    let currentProgress = 0;
const duration = 5000; // 5 seconds
const intervalTime = 50; // update every 50ms
const increment = (intervalTime / duration) * 100; // % per interval

const interval = setInterval(() => {
  currentProgress += increment;
  if (currentProgress >= 100) {
    currentProgress = 100;
    setProgress(currentProgress);
    clearInterval(interval);
    setTimeout(() => setLoading(false), 500); // small delay for smooth finish
  } else {
    setProgress(currentProgress);
  }
}, intervalTime);

    return () => clearInterval(interval);
  }, [gameName, GameComponent]);

  if (!GameComponent) return <h2>Game not found</h2>;

  return (
    <>
      {loading ? (
        <div className="casino-loader">
          <img src="/loading_brand_logo.png" alt="Casino Logo" className="loader-logo" />
          <div className="loader-bar">
            <div
              className="loader-progress"
              style={{ width: `${progress}%`, transition: "width 50ms linear" }}
            ></div>
          </div>
          <p className="loader-text">{Math.round(progress)}% Loading...</p>
          <img
            src="/game_by_pt_white.png"
            alt="Watermark Logo"
            className="loader-corner-logo"
          />
        </div>
      ) : (
        <div className="game-wrapper">
          <GameComponent />
        </div>
      )}
    </>
  );
}
