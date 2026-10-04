export const WORLDS = [
  ["הגן השקט", "כל מסע מתחיל בשחרור.", "#e9efdf", "#78a58c", "חבלים"],
  ["גשרים קטנים", "לפעמים צריך לשנות כיוון.", "#e0ece7", "#6ca3a3", "סיבוב"],
  ["בית המתגים", "עקבו אחרי החיבורים.", "#f4e9d6", "#b5a078", "מתגים"],
  ["עמק הקפיצים", "נפילה היא התחלה של קפיצה.", "#f2e3dc", "#c78e79", "קפיצים"],
  ["אי הרוחות", "הרוח יכולה לעזור. או להפריע.", "#e3edf0", "#8eacbb", "רוח"],
  [
    "יער המשיכה",
    "מה שמושך, לא תמיד מוביל הביתה.",
    "#e8e3ef",
    "#aa93b4",
    "מגנטים",
  ],
  ["שערי המרחק", "דרך קצרה אל מקום רחוק.", "#e0eee7", "#74b0a0", "שערים"],
  ["שמיים הפוכים", "הכול תלוי בנקודת המבט.", "#ece6dc", "#a7a181", "כבידה"],
  ["הגן הנע", "הרגע הנכון משנה הכול.", "#e1e8f1", "#8b9fbc", "תזמון"],
  ["הדרך הביתה", "כל מה שלמדתם, במחשבה אחת.", "#e8e9db", "#91a07b", "שילובים"],
].map(([name, subtitle, bg, accent, mechanic], id) => ({
  id,
  name,
  subtitle,
  bg,
  accent,
  mechanic,
}));

// Each entry is an authored puzzle brief: name, routing, mechanism set,
// gate circuit, orientation, collectible placement and reference solution.
// Circuits use XOR: pressing a switch flips every gate in its mask.
const chapters = [
  [
    ["שחרור ראשון", "drop"],
    ["שני קצוות", "drop"],
    ["מדרון עדין", "ramp"],
    ["הצד השני", "ramp"],
    ["קצת ימינה", "ramp"],
    ["החבל האחרון", "ramp"],
    ["מרחק קטן", "ramp"],
    ["ליפול נכון", "ramp"],
    ["מעבר לפינה", "ramp"],
    ["דרך פתוחה", "ramp"],
  ],
  [
    ["סובבו את הדרך", "rotate"],
    ["מראה ירוקה", "rotate"],
    ["לשנות כיוון", "rotate"],
    ["לפני הנפילה", "rotate"],
    ["קו מחשבה", "rotate"],
    ["הגשר והחבל", "rotate"],
    ["הטיה קטנה", "rotate"],
    ["הדרך הארוכה", "rotate"],
    ["הקצה הנכון", "rotate"],
    ["חושבים קדימה", "rotate"],
  ],
  [
    ["אור ירוק", "gate"],
    ["פתיחה כפולה", "gate", 1],
    ["חיבור נסתר", "gate", 2],
    ["מפתח וגשר", "rotateGate", 0],
    ["המתג המשותף", "gate", 3],
    ["סדר חדש", "rotateGate", 1],
    ["הסחה", "gate", 4],
    ["שתי החלטות", "rotateGate", 2],
    ["כמעט פתוח", "rotateGate", 3],
    ["המעגל", "rotateGate", 4],
  ],
  [
    ["קפיצה ראשונה", "spring"],
    ["הכיוון קובע", "spring"],
    ["קפיצה ומפתח", "springGate", 0],
    ["מעבר לעמק", "springGate", 1],
    ["נחיתה פתוחה", "springGate", 2],
    ["שחרור מדויק", "springGate", 3],
    ["המתג הנוסף", "springGate", 4],
    ["משני הצדדים", "springGate", 2],
    ["מחשבה באוויר", "springGate", 3],
    ["נחיתה אחרונה", "springGate", 4],
  ],
  [
    ["נשימה קלה", "wind"],
    ["רוח נגדית", "wind"],
    ["שינוי באוויר", "windRotate"],
    ["חלון פתוח", "windGate", 0],
    ["רוח ומעגל", "windGate", 1],
    ["הכיוון השקט", "windRotate"],
    ["שתי רוחות", "windGate", 2],
    ["קודם לנשום", "windGate", 3],
    ["לפני הסערה", "windGate", 4],
    ["שקט מחושב", "windRotateGate", 2],
  ],
  [
    ["משיכה ראשונה", "magnet"],
    ["לאן נמשכים", "magnet"],
    ["כוח ומפתח", "magnetGate", 0],
    ["גשר מגנטי", "magnetRotate"],
    ["משיכה משותפת", "magnetGate", 1],
    ["בין שני כוחות", "magnetWind"],
    ["מסלול עקיף", "magnetGate", 2],
    ["לשחרר שליטה", "magnetGate", 3],
    ["הסחה מגנטית", "magnetGate", 4],
    ["איזון עדין", "magnetRotateGate", 2],
  ],
  [
    ["הדלת הרחוקה", "portal"],
    ["יציאה חדשה", "portal"],
    ["הדלת והמפתח", "portalGate", 0],
    ["מסע ברוח", "portalWind"],
    ["צד אחר", "portalGate", 1],
    ["משיכה רחוקה", "portalMagnet"],
    ["שני מעברים", "portalGate", 2],
    ["קודם לפתוח", "portalGate", 3],
    ["הדלת המטעה", "portalGate", 4],
    ["מסע מתוכנן", "portalWindGate", 2],
  ],
  [
    ["למעלה ולמטה", "gravity"],
    ["להפוך מחשבה", "gravity"],
    ["שמיים פתוחים", "gravityGate", 0],
    ["מדרון הפוך", "gravityRotate"],
    ["כוח וכיוון", "gravityGate", 1],
    ["רוח בשמיים", "gravityWind"],
    ["משיכה הפוכה", "gravityMagnet"],
    ["הסדר הנכון", "gravityGate", 2],
    ["שינוי כפול", "gravityGate", 3],
    ["העולם מתהפך", "gravityRotateGate", 2],
  ],
  [
    ["בית בתנועה", "moving"],
    ["לחכות רגע", "moving"],
    ["חלון בזמן", "movingGate", 0],
    ["הגשר הנע", "movingRotate"],
    ["קפיצה בזמן", "movingSpring"],
    ["רגע של שקט", "movingWind"],
    ["שער בתנועה", "movingPortal"],
    ["זמן ומעגל", "movingGate", 2],
    ["תכנון הנחיתה", "movingGate", 3],
    ["הרגע המדויק", "movingRotateGate", 2],
  ],
  [
    ["מבט חדש", "gravityPortal"],
    ["הקפיצה החכמה", "springWindGate", 1],
    ["משיכה וגשר", "magnetRotateGate", 3],
    ["דרך בשמיים", "gravityWindGate", 2],
    ["הדלת הנכונה", "portalMagnetGate", 3],
    ["שקט לפני תנועה", "movingWindGate", 2],
    ["קפיצה אל הבית", "movingSpringGate", 3],
    ["שילוב כוחות", "gravityMagnetGate", 3],
    ["כל הדרך", "portalWindMagnetGate", 3],
    ["הביתה", "movingGravityRotateGate", 3],
  ],
];
const circuits = [
  { initial: [true], masks: [[0]], solution: [0] },
  { initial: [true, true], masks: [[0], [1]], solution: [0, 1] },
  { initial: [true, true], masks: [[0, 1], [0]], solution: [0] },
  {
    initial: [true, false, true],
    masks: [
      [0, 1],
      [1, 2],
      [0, 2],
    ],
    solution: [0, 1],
  },
  { initial: [true, false], masks: [[0, 1], [1], [0]], solution: [0, 1] },
];
export const LEVELS = chapters
  .flatMap((list, w) =>
    list.map(([name, recipe, circuit = 0], j) => {
      const id = w * 10 + j,
        mirror = j % 2 === 1,
        swing = [7, 9].includes(id),
        startX = recipe === "drop" || swing ? 210 : mirror ? 300 : 120,
        goalX = recipe === "drop" ? 210 : mirror ? 120 : 300;
      if (swing) recipe = "swing";
      const features = [
        "rotate",
        "spring",
        "wind",
        "magnet",
        "portal",
        "gravity",
        "moving",
      ].filter((f) => recipe.toLowerCase().includes(f));
      const relay =
        recipe.toLowerCase().includes("gate") &&
        ([28, 29, 39, 49, 59, 69, 79, 89].includes(id) || id >= 93);
      const advancedRelay = relay && id >= 93;
      const gates = advancedRelay
        ? {
            initial: [true, false, false],
            masks: [
              [0, 1],
              [1, 2],
              [0, 2],
            ],
            solution: [2],
          }
        : relay
          ? { initial: [true, false], masks: [[0, 1]], solution: [0] }
          : recipe.toLowerCase().includes("gate")
            ? structuredClone(circuits[circuit])
            : null;
      const setup = features
        .filter((f) => f !== "moving")
        .map((f) => ({ type: f }));
      if (gates)
        setup.push(
          ...gates.solution.map((index) => ({ type: "switch", index })),
        );
      const ropes = id === 0 || id === 98 ? 1 : 2;
      const solution = swing
        ? [
            { type: "rope", index: mirror ? 1 : 0 },
            { type: "waitMs", ms: 200 },
            { type: "rope", index: mirror ? 0 : 1 },
          ]
        : [
            ...setup,
            ...Array.from({ length: ropes }, (_, index) => ({
              type: "rope",
              index,
            })),
            ...(relay
              ? [
                  { type: "waitGate", y: advancedRelay ? 565 : 500 },
                  { type: "switch", index: advancedRelay ? 2 : 0 },
                ]
              : []),
          ];
      return {
        id,
        world: w,
        index: j,
        name,
        recipe,
        startX,
        goalX,
        mirror,
        features,
        gates,
        ropes,
        relay,
        advancedRelay,
        swing,
        par: solution.filter((a) => !a.type.startsWith("wait")).length,
        solution,
        rampY: 320 + (j % 3) * 18,
        speed: 0.7 + (j % 4) * 0.14,
        hint:
          id === 0
            ? "געו בחבל כדי לשחרר את לומו אל הבית."
            : gates
              ? "הקווים מראים אילו מחסומים כל מתג משנה. לא כל מתג צריך להילחץ."
              : features.includes("moving")
                ? "צפו בתנועת הבית. תכננו את רגע השחרור לפי זמן הנפילה."
                : features.includes("portal")
                  ? "פתחו את השער לפני שלומו מגיע אליו."
                  : features.includes("spring")
                    ? "סובבו את הקפיץ לכיוון הבית לפני השחרור."
                    : features.includes("rotate")
                      ? "געו בציר הגשר כדי לשנות את השיפוע."
                      : features.includes("wind")
                        ? "הרוח פועלת באזור המסומן. בדקו אם היא מובילה לכיוון הרצוי."
                        : features.includes("gravity")
                          ? "החץ מציין את כיוון הכבידה. הבית מחכה למטה."
                          : features.includes("magnet")
                            ? "המגנט מושך את לומו הצידה. אפשר לכבות אותו."
                            : "שחררו את החבלים והניחו למדרון להוביל את לומו.",
      };
    }),
  )
  .map((l) => ({
    ...l,
    hint: l.swing
      ? "חבל אחד שומר על התנופה. חתכו חבל אחד, חכו מעט, ואז שחררו את השני לכיוון הבית."
      : l.advancedRelay
        ? "אי אפשר לפתוח את כל המחסומים יחד. בחרו איזה מעבר לסגור רק אחרי שלומו עבר אותו."
        : l.relay
          ? "המתג מחליף בין המחסומים. פתחו את הראשון, חכו שלומו יעבור אותו, ואז החליפו שוב."
          : l.hint,
  }));
