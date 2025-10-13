import { useState, useEffect } from "react";
import styles from "./Lottery.module.css";
import bg from "./seven-up-bg.jpg";
import DealerGifIdle from "./BollywoodDealerIdle.gif";   // टाइमर चलते समय
import DealerGifWait from "./BollywoodDealerWait.gif";   // टाइम खत्म होने के बाद betting lock (सस्पेंस)
import DealerGifResult from "./BollywoodDealerResult.gif"; // result announce के समय
import closedCard from "./closed-card.jpg";

export default function Lottery() {
  const totalTime = 15;
  
    const suits = ["hearts", "clubs", "diamonds", "spades"];
    const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];
  
    const cardValues = {
      "2": 2, "3": 3, "4": 4, "5": 5, "6": 6,
      "7": 7, "8": 8, "9": 9, "10": 10,
      "J": 11, "Q": 12, "K": 13, "A": 14
    };
  
    const [cards, setCards] = useState({ Dragon: null, Tiger: null });
    const [winner, setWinner] = useState("");
    const [betsLocked, setBetsLocked] = useState(false);
    const [revealStep, setRevealStep] = useState(0); // 0 = none, 1 = Dragon, 2 = Tiger
    const [timeLeft, setTimeLeft] = useState(totalTime);
  
    function getRandomCard() {
      const suit = suits[Math.floor(Math.random() * suits.length)];
      const value = values[Math.floor(Math.random() * values.length)];
      return { suit, value };
    }
  
    const getCardImage = (c) => {
      if (!c) return closedCard;
      const suit = c.suit.toLowerCase();
      const val =
        typeof c.value === "number"
          ? c.value
          : c.value === "A"
          ? "ace"
          : c.value === "J"
          ? "jack"
          : c.value === "Q"
          ? "queen"
          : c.value === "K"
          ? "king"
          : c.value;
      return `/${suit}/${suit}_${val}.svg`;
    };
  
    // Start new round
    useEffect(() => {
      setCards({ Dragon: getRandomCard(), Tiger: null });
      setWinner("");
      setTimeLeft(totalTime);
      setBetsLocked(false);
      setRevealStep(0);
    }, []);
  
    // Countdown timer
    useEffect(() => {
      if (timeLeft <= 0) return;
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }, [timeLeft]);
  
    // Sequential reveal & result logic
    useEffect(() => {
      if (timeLeft === 0 && !winner) {
        setBetsLocked(true);
        setRevealStep(1); // Reveal Dragon
  
        const dragonTimeout = setTimeout(() => {
          const tigerCard = getRandomCard();
          setCards((prev) => ({ ...prev, Tiger: tigerCard }));
          setRevealStep(2); // Reveal Tiger
  
          const resultTimeout = setTimeout(() => {
            const dragonVal = cardValues[cards.Dragon.value];
            const tigerVal = cardValues[tigerCard.value];
  
            if (dragonVal > tigerVal) setWinner("Dragon");
            else if (tigerVal > dragonVal) setWinner("Tiger");
            else setWinner("Tie");
  
            // Reset for next round
            setTimeout(() => {
              setCards({ Dragon: getRandomCard(), Tiger: null });
              setWinner("");
              setTimeLeft(totalTime);
              setBetsLocked(false);
              setRevealStep(0);
            }, 3000);
          }, 1500);
  
          return () => clearTimeout(resultTimeout);
        }, 1500);
  
        return () => clearTimeout(dragonTimeout);
      }
    }, [timeLeft]);
  
    const getDealerGif = () => {
      if (winner) return DealerGifResult;
      else if (betsLocked) return DealerGifWait;
      else return DealerGifIdle;
    };
  
    return (
      <div
        className={styles.wrapper}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {/* Game Box */}
        <div className={styles.gameBox} style={{ }}>
          <div className={styles.header}>
            <div className={styles.title}>
              🐉 Dragon Tiger <span className={styles.rules}>Rules</span>
            </div>
            <div className={styles.roundInfo}>Round ID: DRAGON123 | Player History</div>
            <div className={styles.balance}>Bal: 0</div>
          </div>
  
          <div className={styles.gameArea} style={{ backgroundImage: `url(${bg})` }}>
            <img src={getDealerGif()} alt="dealer" className={styles.dealerGif} />
  
            <div className={styles.cardRow}>
              {["Dragon", "Tiger"].map((pos, idx) => (
                <div
                  key={pos}
                  className={`${styles.cardBox} ${winner === pos ? styles.winHighlight : ""}`}
                >
                  <img
                    src={revealStep > idx || winner === pos ? getCardImage(cards[pos]) : closedCard}
                    alt={`${pos} Card`}
                    className={styles.cardImage}
                  />
                  <div className={styles.cardLabel}>{pos.toUpperCase()}</div>
                </div>
              ))}
            </div>
  
            <div className={styles.timerBox}>{timeLeft}</div>
  
            {winner && (
              <div className={styles.overlay}>
                <h1>{winner} Wins</h1>
              </div>
            )}
          </div>
        </div>
  
        {/* Betting Modal */}
        <div
          className={styles.betModal}
          style={{
            opacity: betsLocked ? 0.5 : 1,
            pointerEvents: betsLocked ? "none" : "auto",
          }}
        >
          <div className={styles.betHeader}>
            <div className={styles.betType}>Dragon</div>
            <div className={styles.betType}>Suited Tie</div>
            <div className={styles.betType}>Tiger</div>
            <div className={styles.betType}>Pair</div>
          </div>
  
          <div className={styles.betBody}>
            {/* DRAGON side */}
            <div className={styles.betColumn}>
              <div className={styles.betRow}>
                <button className={styles.betBtn}>2.1 Even</button>
                <button className={styles.betBtn}>1.79 Odd</button>
              </div>
              <div className={styles.betRow}>
                <button className={styles.betBtn}>1.95 ♥♦</button>
                <button className={styles.betBtn}>1.95 ♠♣</button>
              </div>
              <div className={styles.cardsGrid}>
                {["A","2","3","4","5","6","7","8","9","10","J","Q","K"].map((c)=>(
                  <div key={c} className={styles.betCardBox}>{c}</div>
                ))}
              </div>
            </div>
  
            {/* TIGER side */}
            <div className={styles.betColumn}>
              <div className={styles.betRow}>
                <button className={styles.betBtn}>2.1 Even</button>
                <button className={styles.betBtn}>1.79 Odd</button>
              </div>
              <div className={styles.betRow}>
                <button className={styles.betBtn}>1.95 ♥♦</button>
                <button className={styles.betBtn}>1.95 ♠♣</button>
              </div>
              <div className={styles.cardsGrid}>
                {["A","2","3","4","5","6","7","8","9","10","J","Q","K"].map((c)=>(
                  <div key={c} className={styles.betCardBox}>{c}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
