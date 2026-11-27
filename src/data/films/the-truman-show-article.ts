import { trumanArticleStills } from "./the-truman-show-stills";
import type { FilmArticle } from "@/lib/film-package";

/**
 * Film 001 — the public article of the locked edition.
 *
 * This is article v2: the site's article of record. It is data, not JSX, so the
 * integrity rules in `src/lib/film-article-integrity.ts` can hold it to the
 * edition it describes:
 *
 *   - no clock reading lives in prose; every timestamp is a `timeline` item
 *     whose number is identical to a canonical evidence record's;
 *   - no measured number lives in prose; every one of them is a `measurement`
 *     reference rendered from `the-truman-show-master-windows.json`;
 *   - spoiler levels rise monotonically, so the reader's level hides a suffix;
 *   - every correction names evidence, a measurement, or an absent beat.
 *
 * v1 lived in docs/49 as prose and claimed that the library minute was the only
 * one in the film without an edit. Re-measuring the master for the port showed
 * that claim was false — see docs/50-FILM-001-ARTICLE-V2.md.
 */
export const theTrumanShowArticle: FilmArticle = {
  id: "truman-article-v2",
  kicker: "Киножурнал · Питер Уир, 1998",
  title: "Шоу Трумана: человек, который заметил камеру",
  standfirst:
    "Обычный день, знакомые лица и вещь, которой здесь быть не должно. Питер Уир рассказывает о человеке, которому приходится заново учиться доверять собственным глазам. Начнём с одной детали и постепенно дойдём до самых трудных вопросов фильма.",
  // The headline above already fits a tab; the standfirst does not fit a
  // snippet, so the visible standfirst stays long and the snippet says the same
  // thing shorter. Both are the article's own words, not a summary of it.
  seoTitle: "Шоу Трумана: человек, который заметил камеру",
  seoDescription:
    "Иллюстрированный разбор «Шоу Трумана»: как привычный мир, доверие и страх становятся предметом исследования. Сюжет раскрывается постепенно.",
  byline: {
    author: "Редакция «Глубоких вод»",
    editorialRevision: "article-v2",
    draftedAt: "2026-10-28",
    // Signed on delegated authority: the editor authorised the date in advance
    // and owns the verdict, the build only records it (docs/53 §1).
    reviewedAt: "2026-10-28",
    signatureBasis: "DELEGATED",
  },
  edition: {
    sourceId: "truman-src-master-bdrip",
    measuredRuntimeSeconds: 6177.792,
  },
  sections: [
    {
      id: "truman-article-method",
      number: 1,
      eyebrow: "01 / Первый сбой",
      heading: "Звезда на тротуаре",
      spoilerLevel: "NONE",
      moduleIds: ["truman-mod-sources"],
      blocks: [
        {
          kind: "paragraph",
          id: "truman-article-method-1",
          text:
            "Синяя вещь на тротуаре не похожа на то, что обычно падает с неба. Это осветительный прибор; на наклейке читается Sirius. Труман стоит перед ним. В этом простом соседстве человека и предмета Питер Уир уже ставит вопрос всего фильма: как отличить то, что произошло, от истории, которую нам об этом расскажут?",
          support: { evidenceIds: ["truman-ev-light"] },
        },
        {
          kind: "timeline",
          id: "truman-article-method-anchors",
          items: [
            {
              id: "truman-article-anchor-interviews",
              timestampSeconds: 19.1,
              label: "Начальное интервью о замысле шоу; место действия по одному кадру не определить",
              evidenceId: "truman-ev-interviews",
            },
            {
              id: "truman-article-anchor-daycount",
              timestampSeconds: 163.9,
              label: "Титры объявляют день, которым живёт герой",
              evidenceId: "truman-ev-daycount",
            },
            {
              id: "truman-article-anchor-light",
              timestampSeconds: 210,
              label: "На тротуаре лежит осветительный прибор с надписью Sirius",
              evidenceId: "truman-ev-light",
              still: trumanArticleStills.light,
            },
          ],
        },
        {
          kind: "paragraph",
          id: "truman-article-method-2",
          text:
            "Вскоре английские субтитры передают объяснение: с самолёта упали детали. Предмет тот же, а его смысл уже другой. Вместо загадки нам предлагают знакомую бытовую историю. Для Трумана это возможное объяснение странности; для зрителя, которому начальные интервью дали другую рамку, — повод не принимать его на веру. Нам ещё предстоит понять, как устроена эта разница.",
          support: { evidenceIds: ["truman-ev-light-explanation"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-method-3",
          text:
            "У зрителя с самого начала другое положение. Интервью в начале фильма предлагает рамку, которой у Трумана в этот момент нет. Поэтому предмет для него — загадка, а для нас — повод сопоставить то, что мы видим, с тем, как окружающие объясняют увиденное. Режиссёр заставляет нас заметить разницу в доступе к знанию, не превращая героя в глупца.",
          support: { evidenceIds: ["truman-ev-interviews"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-method-4",
          text: "Мы сами постоянно пользуемся чужими объяснениями: верим сообщению по радио, словам знакомого, подписи на фотографии. Без такого доверия невозможно жить. Но доверие становится опасным, если у человека нет независимой возможности проверить того, кто объясняет ему происходящее.",
        },
        {
          kind: "paragraph",
          id: "truman-article-method-5",
          text:
            "Первый сбой ещё не даёт Труману ответа. Он лишь делает вопрос возможным. И вот за чем стоит следить дальше: не за тем, сколько странностей удастся насчитать, а за тем, как меняется его отношение к собственному опыту. Когда знакомая версия перестаёт объяснять увиденное, любопытство может стать мужеством.",
        },
      ],
    },
    {
      id: "truman-article-machine",
      number: 2,
      eyebrow: "02 / История",
      heading: "Когда привычный мир начинает противоречить себе",
      spoilerLevel: "MINOR",
      moduleIds: ["truman-mod-story"],
      blocks: [
        {
          kind: "paragraph",
          id: "truman-article-machine-1",
          text:
            "Начальные интервью дают зрителю преимущество: нам предлагают смотреть на жизнь Трумана как на представление. Это не нейтральное описание человека, а предложение поверить в ценность зрелища. И чем убедительнее кажется такое предложение, тем важнее спросить, кто вправе согласиться на него.",
          support: { evidenceIds: ["truman-ev-interviews"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-machine-2",
          text:
            "Утреннее приветствие, знакомые лица, дорога на работу — повтор делает город узнаваемым. Для Трумана это опора повседневности; зрителю повтор помогает заметить её искусственность. Отдельные записи не позволяют составить расписание каждого соседа, но они дают основание читать рутину как часть устроенного мира.",
          support: { evidenceIds: ["truman-ev-greeting", "truman-ev-routine"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-machine-3",
          text:
            "Упавший прибор — только первый случай. Теперь обратим внимание на то, как фильм меняет масштаб: от предмета, оказавшегося не на своём месте, к самим условиям, в которых живёт человек.",
          support: { evidenceIds: ["truman-ev-light", "truman-ev-light-explanation"] },
        },
        { kind: "subhead", id: "truman-article-rain-layers", text: "Дождь, который выделяет одного человека" },
        {
          kind: "paragraph",
          id: "truman-article-machine-rain",
          text:
            "Труман наклоняется под узкой светлой струёй дождя, почти исчезающей в темноте вокруг. Погода обычно объединяет всех, кто находится на одной улице. В этом изображении, напротив, она выделяет одного человека. Комизм сцены строится на нарушении привычного ожидания.",
          support: { evidenceIds: ["truman-ev-rain"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-rain-form",
          text:
            "На раннем сохранённом кадре видна именно узкая струя. При отдельной проверке исходного MKV 4 ноября 2026 года в последовательности выборочных кадров видно и расширение области дождя. Это два разных наблюдения, а не доказательство точной механики эффекта. Но их достаточно, чтобы обсуждать, как фильм делает привычное явление странным.",
          support: { evidenceIds: ["truman-ev-rain"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-rain-meaning",
          text:
            "Изнутри происходящего Труман сталкивается с необычной погодой; зритель уже может прочитать этот эпизод как знак особого положения героя. Не обязательно знать, как сняли эффект, чтобы увидеть его смысл: мир, казавшийся общим для всех, словно обращается к одному человеку.",
          support: { evidenceIds: ["truman-ev-rain"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-rain-limits",
          text:
            "Особенно выразительно, что странность не требует от героя немедленного большого решения. Она оставляет его перед маленьким вопросом о собственной повседневности. Позднее фильм позволит связать такие вопросы между собой.",
          support: { evidenceIds: ["truman-ev-rain"] },
        },
        {
          kind: "timeline",
          id: "truman-article-machine-anchors",
          items: [
            {
              id: "truman-article-anchor-rain",
              timestampSeconds: 750,
              label: "Выборочный кадр: Труман под узкой струёй дождя; движение по нему не восстановить",
              evidenceId: "truman-ev-rain",
              still: trumanArticleStills.rain,
            },
            {
              id: "truman-article-anchor-ghost",
              timestampSeconds: 910,
              label: "Человек, которого герой считает мёртвым, появляется в толпе — и его уводят силой",
              evidenceId: "truman-ev-ghost",
              still: trumanArticleStills.ghost,
            },
            {
              id: "truman-article-anchor-radio",
              timestampSeconds: 1798.265,
              label: "В английских субтитрах записана команда статистам; её говорящий и звучание по этому доказательству не установлены",
              evidenceId: "truman-ev-radio",
            },
            {
              id: "truman-article-anchor-newspaper",
              timestampSeconds: 1830,
              label: "Газета The Island: CRACKDOWN ON HOMELESS; личность человека на фотографии не установлена",
              evidenceId: "truman-ev-europe",
              still: trumanArticleStills.newspaper,
            },
            {
              id: "truman-article-anchor-elevator",
              timestampSeconds: 2110,
              label: "За дверью служебного лифта нет кабины: там коридор, по которому ходят люди со съёмочной группы",
              evidenceId: "truman-ev-elevator",
              still: trumanArticleStills.elevator,
            },
          ],
        },
        {
          kind: "paragraph",
          id: "truman-article-machine-4",
          text:
            "На улице Труман узнаёт пожилого мужчину, которого вскоре уводят. Газета с заголовком CRACKDOWN ON HOMELESS предлагает объяснение появления бездомных. Нельзя удостоверить по имеющимся изображениям, что на фотографии именно встреченный человек или что заголовок появился специально после встречи. Сопоставление всё же важно: личное узнавание и публичная версия события могут расходиться.",
          support: { evidenceIds: ["truman-ev-europe"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-machine-5",
          text: "Другая странность — открытый служебный проём, за которым вместо ожидаемой кабины видны оборудование и люди. Если газета предлагает готовое значение увиденного, то здесь сама вещь перестаёт соответствовать своему обычному назначению. Сихейвен делается ненадёжным не только как рассказ о мире, но и как физическое пространство.",
        },
        {
          kind: "pullquote",
          id: "truman-article-machine-pullquote",
          text: "Самое надёжное насилие — не запрет, а словарь. Забор можно потрогать. Заголовок — нет.",
        },
        {
          kind: "paragraph",
          id: "truman-article-machine-6",
          text:
            "Плакаты об опасности путешествий добавляют к этому ещё один слой. Граница может выглядеть как совет, а предостережение — как забота. Чтобы понять, почему такой совет действенен именно для Трумана, нужно обратиться к его отношению с водой.",
          support: { evidenceIds: ["truman-ev-poster"] },
        },
      ],
    },
    {
      id: "truman-article-cast",
      number: 3,
      eyebrow: "03 / Персонажи",
      heading: "Мечта, страх и люди, которым веришь",
      standfirst:
        "Вместо поиска одного злодея рассмотрим ответственность людей вокруг Трумана: какие решения они принимают, что знают и какую цену платят за свои роли.",
      spoilerLevel: "MAJOR",
      moduleIds: ["truman-mod-characters"],
      blocks: [
        {
          kind: "paragraph",
          id: "truman-article-cast-1",
          text:
            "Мы привыкли судить персонажа по тому, что он делает в кадре. Здесь приходится добавить вопрос: что известно ему в момент поступка? Труман, его близкие и люди, организующие представление, находятся в совершенно разных условиях знания. Отсюда возникает разница и в ответственности.",
        },
        {
          kind: "paragraph",
          id: "truman-article-cast-truman",
          text:
            "В воспоминании мальчик находится в лодке с отцом; во время шторма отец оказывается за бортом. Море в его истории связано не просто с опасностью, а с утратой близкого. И тот же Труман мечтает о Фиджи. В этом психологическая сила конфликта: путь к желанному требует встретиться с тем, от чего естественно защищаться. Позднее в интервью появляется признание, что для удержания героя на острове придумывали способы. Оно меняет наше понимание границ его свободы, но не делает каждую реакцию Трумана заранее вычисленной. Страх может быть настоящим, даже если его обстоятельствами воспользовались другие.",
          support: { evidenceIds: ["truman-ev-fiji", "truman-ev-drowning", "truman-ev-manufactured-limits"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-cast-truman-2",
          text:
            "Если оценивать Трумана только по способности быстро распознать обман, мы упустим самое важное. Обычная жизнь требует доверия к близким, к памяти, к привычкам. Усомниться здесь — значит рисковать не одной ошибочной догадкой, а всей системой отношений. Поэтому его постепенное движение к самостоятельному решению убедительнее образа героя, который с первой минуты знает все ответы.",
        },
        {
          kind: "paragraph",
          id: "truman-article-cast-christof",
          text:
            "Кристоф связан с устройством Сихейвена и его объяснением зрителям. Его позиция становится интересной там, где забота перестаёт быть предложением и превращается в право определять чужую жизнь. Не нужно объявлять его неспособным любить: вопрос фильма труднее — достаточно ли любви, если человеку не оставляют выбора?",
          support: { evidenceIds: ["truman-ev-seahaven-design", "truman-ev-interviews"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-cast-meryl",
          text:
            "На кухне рядом с супружеским конфликтом возникает рекламный текст о какао. Мэрил находится одновременно в отношении с человеком и в рабочей роли перед аудиторией. Труман не располагает той информацией о её роли, которой располагает зритель. Поэтому вопрос не сводится к искренности улыбки или предполагаемой интонации: сама неравномерность знания меняет смысл разговора.",
          support: { evidenceIds: ["truman-ev-cocoa-subtitles", "truman-ev-knife-call"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-cast-marlon",
          text:
            "Особенно важна фраза о том, что друг никогда не стал бы лгать. Выборочная машинная сверка оригинальной английской дорожки подтверждает повтор близких фраз; она не удостоверила голоса каждого говорящего и интонации, а непрерывный монтаж не проверялся. Однако нравственный смысл обещания понятен без догадок о голосе: доверие Трумана нельзя заменить ещё одним объяснением окружающего мира.",
          support: { evidenceIds: ["truman-ev-marlon-retake"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-cast-sylvia",
          text:
            "Сильвия предлагает Труману объяснение, которое нарушает привычный порядок. Позднее её участие в разговоре о шоу позволяет увидеть, что предупреждение не сводится к мимолётной встрече. В её линии важен риск сказать правду человеку, которого другие привыкли считать частью представления.",
          support: { evidenceIds: ["truman-ev-sylvia", "truman-ev-trutalk"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-cast-mother",
          text:
            "В эпизоде с альбомом появляется предмет, через который семья обычно хранит общую память. Здесь память тоже оказывается частью отношений, устроенных не на равных. Выборка не даёт нам права назвать чувства матери поддельными, но позволяет спросить, может ли семейная близость выдержать правду о собственной истории.",
          support: { evidenceIds: ["truman-ev-album"] },
        },
        {
          kind: "pullquote",
          id: "truman-article-cast-pullquote",
          text: "Все в этом городе играют. Не играет один — и именно его показывают круглосуточно.",
        },
        {
          kind: "timeline",
          id: "truman-article-cast-anchors",
          items: [
            {
              id: "truman-article-anchor-sylvia",
              timestampSeconds: 1615.201,
              label: "Предупреждение Сильвии: «Это фальшивка. Всё это для тебя. Небо…»",
              evidenceId: "truman-ev-sylvia",
              still: trumanArticleStills.sylvia,
            },
            {
              id: "truman-article-anchor-album",
              timestampSeconds: 2222.262,
              label: "Мать задерживается на странице семейного альбома",
              evidenceId: "truman-ev-album",
            },
            {
              id: "truman-article-anchor-marlon-retake",
              timestampSeconds: 3459.2,
              label: "Обещание повторяется в субтитрах почти дословно; изображение монитора не доказывает слова реплики",
              evidenceId: "truman-ev-marlon-retake",
            },
          ],
        },
        {
          kind: "paragraph",
          id: "truman-article-cast-2",
          text:
            "Герои занимают в шоу разные позиции: одни знают о представлении, Труман — нет. Это не позволяет автоматически измерить искренность Кристофа, Мэрил или Марлона. Можно сочувствовать тому, чьи отношения поставлены в условия обмана, не объявляя чувства других поддельными.",
        },
      ],
    },
    {
      id: "truman-article-bonds",
      number: 4,
      eyebrow: "04 / Связи",
      heading: "Любовь и дружба, в которых нельзя сказать правду",
      standfirst:
        "У брака есть спонсор, у дружбы — рабочая смена, у возвращения отца — место в эфирной сетке. Это не отменяет возможных чувств, но делает условия близости неравными.",
      spoilerLevel: "MAJOR",
      moduleIds: ["truman-mod-relationship", "truman-mod-friendship"],
      blocks: [
        {
          kind: "paragraph",
          id: "truman-article-bonds-1",
          text:
            "Брак, дружба и семейная память обещают человеку пространство, где не нужно играть роль. Трагедия Трумана в том, что именно через эти отношения ему труднее всего проверить происходящее. Рассмотрим не предполагаемую тайную психологию актёров, а то, что меняется в конкретных разговорах.",
        },
        { kind: "subhead", id: "truman-article-bonds-marriage-head", text: "Брак, у которого есть спонсор" },
        {
          kind: "paragraph",
          id: "truman-article-bonds-marriage",
          text:
            "На кухне личный разговор соседствует с рекламным текстом о какао Mococoa. Представим не тайные мысли Мэрил, а несовпадение целей двух участников: супругу нужно объяснение происходящего в их жизни, а рекламная речь рассчитана на потенциальную аудиторию. Зритель знает о рабочей роли Мэрил то, чего не знает Труман. Так бытовая комедия становится сценой о невозможности взаимного разговора там, где один человек живёт в отношениях, а другой также исполняет публичную роль.",
          support: { evidenceIds: ["truman-ev-cocoa-subtitles", "truman-ev-knife-tools", "truman-ev-meryl-held"] },
        },
        {
          kind: "illustration",
          id: "truman-article-illu-grater",
          assetId: "illu-truman-caric-grater",
          layout: "inset",
          caption:
            "Карикатура: она играет для зала, которого в комнате нет, — и не оборачивается. Рисунок, не кадр из фильма.",
        },
        {
          kind: "paragraph",
          id: "truman-article-bonds-marriage-2",
          text:
            "В другом кадре Мэрил держит кухонные инструменты, позднее Труман физически удерживает её. В субтитрах и выборке звука есть просьба о помощи «Сделай же что-нибудь!», но её точный адресат не установлен. Это важная граница: разоблачение обмана не делает всякое действие обманутого правомерным. Даже в несправедливых отношениях нельзя забыть о безопасности другого человека.",
          support: { evidenceIds: ["truman-ev-knife-tools", "truman-ev-knife-call", "truman-ev-meryl-held"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-bonds-marriage-3",
          text:
            "Реклама здесь особенно выразительна как столкновение двух способов общения: супруги могут говорить друг с другом, а участник эфира обращается к аудитории. Отдельное изображение на мониторе делает второе пространство видимым. Для зрителя это не повод насмешливо осудить Мэрил, а повод понять, насколько неравными стали условия близости.",
          support: { evidenceIds: ["truman-ev-cocoa-subtitles", "truman-ev-knife-tools", "truman-ev-meryl-held"] },
        },
        {
          kind: "duel",
          id: "truman-article-duel-kitchen",
          label: "Дуэль 01 · адресат",
          question: "К кому обращена эта сцена — и меняется ли адресат по ходу разговора?",
          sides: [
            {
              id: "truman-article-duel-kitchen-truman",
              label: "Труман → Мэрил",
              reading:
                "Он требует объяснений и задаёт личные вопросы. По субтитрам вопрос о том, собирается ли она его резать или чистить, задаёт он; назвать это попыткой вернуть разговор в комнату — уже интерпретация.",
              evidenceIds: ["truman-ev-knife-tools"],
            },
            {
              id: "truman-article-duel-kitchen-camera",
              label: "Мэрил → камера",
              reading:
                "Рекламная речь о какао вторгается в личный разговор. Её можно читать как обращение к аудитории шоу; реакцию и точный адрес реплики нужно сверять с непрерывной сценой и звуком.",
              evidenceIds: ["truman-ev-mococoa"],
            },
            {
              id: "truman-article-duel-kitchen-crew",
              label: "Возможный адрес просьбы",
              reading:
                "Просьбу «Сделай же что-нибудь!» можно читать как обращение к создателям шоу. Субтитр и отдельный кадр сами по себе не устанавливают говорящего или адресата.",
              evidenceIds: ["truman-ev-knife-call"],
            },
          ],
          open:
            "Кто произносит просьбу и кому она адресована? Версия об обращении к создателям требует проверки сцены со звуком; чувства Мэрил остаются вопросом интерпретации.",
        },
        { kind: "subhead", id: "truman-article-camera-head", text: "Чья камера? Кухня и монитор" },
        {
          kind: "paragraph",
          id: "truman-article-camera-film",
          text:
            "Кадр фильма. На одном из проверенных изображений Мэрил держит перед собой кухонные инструменты. По этому стоп-кадру нельзя определить, чьим взглядом внутри вымышленного шоу мы пользуемся.",
          support: { evidenceIds: ["truman-ev-knife-tools"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-camera-show",
          text:
            "Экран внутри фильма. На другом изображении Труман удерживает Мэрил, и оба видны на мониторе. Рамка монитора позволяет говорить о показе сцены кому-то ещё, но не устанавливает расположение конкретной камеры и непрерывность перехода. Кто именно смотрит в этот момент — отдельный вопрос для проверки.",
          support: { evidenceIds: ["truman-ev-meryl-held"] },
        },
        { kind: "subhead", id: "truman-article-bonds-friendship-head", text: "Дружба, у которой есть смена" },
        {
          kind: "paragraph",
          id: "truman-article-bonds-friendship",
          text:
            "В разговоре о Фиджи рядом с мечтой Трумана появляется рекламная реплика о пиве. Сочетание личной темы и товарной речи позволяет увидеть, как близость включена в экономику шоу. Но оно не доказывает, что дружеская привязанность никогда не существовала.",
          support: { evidenceIds: ["truman-ev-beer"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-bonds-friendship-2",
          text:
            "Обещание друга не лгать весит иначе, чем сообщение по радио. В нём человек предлагает в качестве гарантии самого себя и их общую историю. Машинное распознавание исходной английской дорожки подтвердило повтор близких фраз, но не установило личность говорящего в каждом повторе и не удостоверило интонацию. Мы не знаем, насколько искренне Марлон привязан к другу. Зато можем спросить, что верность требует от него тогда, когда правда грозит разрушить привычный порядок.",
          support: { evidenceIds: ["truman-ev-marlon", "truman-ev-marlon-retake"] },
        },
        {
          kind: "duel",
          id: "truman-article-duel-promise",
          label: "Одно обещание · три перспективы",
          question: "Это разговор двух друзей или фрагмент управляемого представления?",
          sides: [
            {
              id: "truman-article-duel-promise-hears",
              label: "Перспектива Трумана",
              reading:
                "Обещание не лгать можно прочитать как попытку сохранить доверие: для Трумана слово друга имеет вес. Это интерпретация отношений, а не доказательство чувств Марлона.",
              evidenceIds: ["truman-ev-marlon"],
            },
            {
              id: "truman-article-duel-promise-sees",
              label: "Перспектива зрителя",
              reading:
                "Разговор происходит в устроенном для эфира мире. Можно усомниться в свободе друга говорить за себя, но два похожих фрагмента субтитров сами по себе не доказывают ни подсказку, ни монтаж между ними.",
              evidenceIds: ["truman-ev-marlon-retake"],
            },
            {
              id: "truman-article-duel-promise-ethics",
              label: "Нравственный вопрос",
              reading:
                "Близость не даёт разрешения обманывать близкого. Даже если Марлон испытывает настоящую привязанность, участие в устройстве чужой жизни остаётся отдельным вопросом ответственности. Другу нужна правда, а не только утешение.",
              evidenceIds: ["truman-ev-marlon", "truman-ev-marlon-retake"],
            },
          ],
          open:
            "Можно ли из повтора заключить, что Марлон ничего не чувствует? Нет. Субтитры фиксируют две почти дословные строки, а выборочное распознавание исходного английского звука подтверждает повторение близких фраз. Однако оно не удостоверяет, кто именно произнёс каждую реплику, с какой интонацией и почему она повторилась. Эти данные не доказывают, что разговор «производится», и ничего не говорят о чувствах друга. Поэтому мы не ставим ему оценку за дружбу.",
        },
        {
          kind: "paragraph",
          id: "truman-article-bonds-friendship-3",
          text:
            "Возвращение отца добавляет к разговору ещё один слой. На отдельных кадрах видны объятие у ограждения моста и изображение в аппаратной. Зритель получает возможность видеть встречу как событие и как часть представления. Сам Труман в момент встречи не имеет равного доступа к этой второй стороне.",
          support: { evidenceIds: ["truman-ev-marlon", "truman-ev-reunion"] },
        },
        {
          kind: "pullquote",
          id: "truman-article-bonds-pullquote",
          text: "У каждого, кто его любит, есть работодатель. У него самого — только расписание.",
        },
        {
          kind: "paragraph",
          id: "truman-article-bonds-3",
          text:
            "Третье отношение — с создателем — устроено ещё неравнее. Один располагает сведениями о жизни другого, тогда как Труман долго не имеет возможности даже назвать своего собеседника. Позднее станет ясно, почему такое неравенство знания имеет значение для его выбора.",
        },
        {
          kind: "illustration",
          id: "truman-article-illu-trophy",
          assetId: "illu-truman-caric-trophy",
          layout: "inset",
          caption:
            "Карикатура: человек, который построил город, держит его жителя под стеклом — трофей в витрине, а не человек в мире. Рисунок, не кадр из фильма.",
        },
        {
          kind: "timeline",
          id: "truman-article-bonds-anchors",
          items: [
            {
              id: "truman-article-bond-beer",
              timestampSeconds: 587.226,
              label: "Разговор о Фиджи на мосту, поверх которого ложится реклама пива",
              evidenceId: "truman-ev-beer",
            },
            {
              id: "truman-article-bond-mococoa",
              timestampSeconds: 3226.152,
              label: "Рекламный текст о какао в кухонной сцене; адрес реплики не установлен",
              evidenceId: "truman-ev-mococoa",
            },
            {
              id: "truman-article-bond-knife",
              timestampSeconds: 3255,
              label: "Упаковка «Chef's Pal» на столе; отметка приблизительна",
              evidenceId: "truman-ev-knife",
            },
            {
              id: "truman-article-bond-tools",
              timestampSeconds: 3265,
              label: "Мэрил держит инструменты перед собой; отметка приблизительна",
              evidenceId: "truman-ev-knife-tools",
              still: trumanArticleStills.merylTools,
            },
            {
              id: "truman-article-bond-knife-call",
              timestampSeconds: 3272.199,
              label: "В субтитрах: «Сделай же что-нибудь!»; говорящий и адресат требуют проверки",
              evidenceId: "truman-ev-knife-call",
            },
            {
              id: "truman-article-bond-held",
              timestampSeconds: 3275,
              label: "На экране Труман удерживает Мэрил; отметка приблизительна",
              evidenceId: "truman-ev-meryl-held",
              still: trumanArticleStills.merylHeld,
            },
            {
              id: "truman-article-bond-retake",
              timestampSeconds: 3459.2,
              label: "Обещание повторяется в субтитрах; причинная связь с аппаратной не установлена",
              evidenceId: "truman-ev-marlon-retake",
            },
            {
              id: "truman-article-bond-marlon",
              timestampSeconds: 3464.272,
              label: "«Последнее, что я стал бы делать, — врать тебе»",
              evidenceId: "truman-ev-marlon",
            },
            {
              id: "truman-article-bond-reunion",
              timestampSeconds: 3591,
              label: "Труман обнимает отца у ограждения моста; отметка приблизительна",
              evidenceId: "truman-ev-reunion",
              still: trumanArticleStills.reunion,
            },
          ],
        },
        {
          kind: "paragraph",
          id: "truman-article-bonds-4",
          text:
            "Участие в обмане и возможная искренняя привязанность не исключают друг друга. Именно это делает нравственный вопрос фильма серьёзным. Работа, дружба или забота не освобождают человека от ответственности за то, что он делает с доверием другого.",
        },
      ],
    },
    {
      id: "truman-article-props",
      number: 5,
      eyebrow: "05 / Реквизит",
      heading: "Мир как реквизит: три предмета, которые всё объясняют",
      standfirst:
        "Кнопка, инструменты и лестница. Ни один из них не пришёл в кадр как символ: каждый пришёл как товар или как декорация — и уже потом стал доказательством.",
      spoilerLevel: "ENDING",
      moduleIds: ["truman-mod-autopsy"],
      blocks: [
        { kind: "subhead", id: "truman-article-props-button-head", text: "Кнопка" },
        {
          kind: "paragraph",
          id: "truman-article-props-button",
          text:
            "В подвале рука прижимает к груди круглую кнопку с вопросом «Ну и чем это кончится?»; пальцы при этом скрещены. Это маленький предмет, на котором встречаются две вещи: желание узнать конец истории и знакомый жест, допускающий прочтение как знак ненадёжного обещания. Из кадра не следует, кто изготовил кнопку, как она оказалась у героя или что он при этом думал.",
          support: { evidenceIds: ["truman-ev-fingers"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-props-button-2",
          text:
            "Кнопка со скрещёнными пальцами — наблюдаемый предмет. Приписывать этот жест другому кадру или делать из него признание Трумана в самообмане нельзя. Но сам вопрос на кнопке необычно сближает жизнь героя с ожиданием зрителя: человеку предстоит жить дальше, а аудитория хочет узнать, чем кончится история.",
        },
        { kind: "subhead", id: "truman-article-props-grater-head", text: "Инструменты" },
        {
          kind: "paragraph",
          id: "truman-article-props-grater",
          text:
            "Сцену срыва часто пересказывают так: Труман хватает нож. В проверенных отдельных кадрах видна другая деталь: на столе лежит упаковка «Chef's Pal», а позднее Мэрил держит кухонные инструменты перед собой. В субтитрах рядом с эпизодом есть рекламный текст о какао Mococoa — напитке, а не инструменте. Эти выборочные кадры не доказывают, что во всей сцене нет ножа, и сами по себе не устанавливают, кто произносит ту или иную реплику.",
          support: { evidenceIds: ["truman-ev-cocoa-subtitles", "truman-ev-knife", "truman-ev-knife-tools"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-props-grater-2",
          text:
            "Кадры показывают предметы и удержание, звук и субтитры — просьбу о помощи. Это не даёт полной картины намерений обоих участников. У кухонного инструмента есть бытовое назначение; внутри конфликта его присутствие заставляет нас внимательнее отнестись к уязвимости обоих.",
          support: { evidenceIds: ["truman-ev-knife-tools", "truman-ev-knife-call", "truman-ev-meryl-held"] },
        },
        { kind: "subhead", id: "truman-article-props-ladder-head", text: "Лестница" },
        {
          kind: "paragraph",
          id: "truman-article-props-ladder",
          text:
            "Нарисованное небо заканчивается плоской панелью, у которой стоит лестница. Здесь рисунок, который должен был обозначать бесконечность, превращается в обычную поверхность. Лестница делает этот переход особенно выразительным: вместо недостижимого горизонта перед человеком оказывается предмет человеческого масштаба. Это не доказательство того, кто красил декорацию, а наблюдение о том, как предметы меняют смысл пространства.",
          support: { evidenceIds: ["truman-ev-wall"] },
        },
        {
          kind: "illustration",
          id: "truman-article-illu-sky",
          assetId: "illu-truman-caric-sky",
          layout: "inset",
          caption:
            "Карикатура: горизонт — это окрашенная поверхность, и у неё есть рабочее место. Стремянка, валик, ведро; человек в лодке просто оказался меньше работы. Рисунок, не кадр из фильма.",
        },
        {
          kind: "timeline",
          id: "truman-article-props-anchors",
          items: [
            {
              id: "truman-article-anchor-fingers",
              timestampSeconds: 1700,
              label: "Кнопка у сердца: скрещенные пальцы на вопросе о том, чем всё кончится",
              evidenceId: "truman-ev-fingers",
            },
            {
              id: "truman-article-anchor-mococoa",
              timestampSeconds: 3226.152,
              label: "Мэрил в кухонной сцене с рекламным текстом о какао",
              evidenceId: "truman-ev-mococoa",
              still: trumanArticleStills.mococoa,
            },
            {
              id: "truman-article-anchor-knife",
              timestampSeconds: 3255,
              label: "Упаковка «Chef's Pal» на столе; отметка приблизительна",
              evidenceId: "truman-ev-knife",
              still: trumanArticleStills.kitchen,
            },
            {
              id: "truman-article-anchor-tools",
              timestampSeconds: 3265,
              label: "Мэрил держит инструменты перед собой; отметка приблизительна",
              evidenceId: "truman-ev-knife-tools",
            },
            {
              id: "truman-article-anchor-knife-call",
              timestampSeconds: 3272.199,
              label: "В субтитрах: «Сделай же что-нибудь!»; говорящий и адресат не названы",
              evidenceId: "truman-ev-knife-call",
            },
            {
              id: "truman-article-anchor-held",
              timestampSeconds: 3275,
              label: "На экране Труман удерживает Мэрил; отметка приблизительна",
              evidenceId: "truman-ev-meryl-held",
            },
            {
              id: "truman-article-anchor-wall",
              timestampSeconds: 5510,
              label: "Нарисованное небо заканчивается панелью, у которой стоит лестница",
              evidenceId: "truman-ev-wall",
              still: trumanArticleStills.wallStairs,
            },
          ],
        },
      ],
    },
    {
      id: "truman-article-craft",
      number: 6,
      eyebrow: "06 / Ремесло",
      heading: "Как кино заставляет нас смотреть иначе",
      standfirst:
        "Скрытые камеры, виньетки, эффект подглядывания: об этом фильме легко говорить готовыми формулами. Сравним конкретные эпизоды и проверим, чего автоматический подсчёт переходов и записей субтитров не может доказать.",
      spoilerLevel: "ENDING",
      moduleIds: ["truman-mod-craft"],
      blocks: [
        {
          kind: "measurement",
          contentSpoilerLevel: "ENDING",
          id: "truman-article-craft-totals",
          measurement: { table: "totals", id: "master" },
          text:
            "Полный SHA-256 исходного файла независимо пересчитан 4 ноября 2026 года. Но детектор кадровой разницы заново не запускался на всём фильме: число обнаруженных переходов здесь взято из прежнего полного отчёта. Рядом — число записей в английских субтитрах; одна запись не обязательно равна одной реплике.",
        },
        {
          kind: "paragraph",
          id: "truman-article-craft-1",
          text:
            "У фильма есть два масштаба внимания: человек в привычной среде и человек, на которого смотрят. Измерения смен изображения могут помочь проверить различие между эпизодами, но не подменяют наблюдение за тем, что именно показывается.",
        },
        {
          kind: "measurement",
          contentSpoilerLevel: "ENDING",
          id: "truman-article-craft-hold-father",
          measurement: { table: "hold", id: "hold-01" },
          text:
            "Самый длинный интервал без обнаруженного перехода расположен во время разговора с Марлоном, а не в сцене объятия с отцом. Проверенные отдельные кадры внутри этого интервала показывают разные планы Марлона и Трумана: детектор действительно пропустил смены, поэтому назвать его монтажной паузой было бы ошибкой.",
        },
        {
          kind: "measurement",
          contentSpoilerLevel: "ENDING",
          id: "truman-article-craft-hold-library",
          measurement: { table: "hold", id: "hold-02" },
          text:
            "Второй интервал приходится на библиотеку. В разных его частях видны Труман за столом, другие посетители и позднее девушка в красном; это не описание каждого момента окна.",
          support: { evidenceIds: ["truman-ev-sylvia"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-craft-2",
          text:
            "Длинный промежуток без обнаруженного скачка кадровой разницы ещё не значит, что перед нами непрерывный план. В выборках разговора с Марлоном и библиотечного эпизода видны смены изображения, которые детектор пропустил. Для разговора о режиссуре важнее эта конкретная оговорка, чем впечатляющее число.",
        },
        {
          kind: "measurement",
          contentSpoilerLevel: "ENDING",
          id: "truman-article-craft-silence",
          measurement: { table: "silence", id: "silence-01" },
          text:
            "Самый длинный внутренний промежуток без действующих записей субтитров приходится на финал: у края нарисованного неба детектор продолжает находить переходы. Запись субтитров — не обязательно реплика, а отсутствие субтитров не доказывает отсутствия речи или звука.",
          support: { evidenceIds: ["truman-ev-wall"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-craft-3",
          text:
            "Когда герой оказывается у нарисованной границы, его положение становится видимым буквально. Нельзя вывести тишину из отсутствия субтитров, но можно увидеть выразительность сопоставления человека и поверхности, которую он должен был принять за мир.",
        },
        {
          kind: "measurement-table",
          contentSpoilerLevel: "NONE",
          id: "truman-article-craft-windows",
          caption: "Четыре окна, в которых видно, как фильм дышит.",
          columns: ["Момент", "Обнаруженные переходы", "Начавшиеся записи субтитров"],
          rows: [
            {
              id: "truman-article-window-library",
              contentSpoilerLevel: "MINOR",
              label: "Библиотека: Труман, посетители и девушка в красном",
              measurement: { table: "window", id: "library" },
            },
            {
              id: "truman-article-window-hes-gone",
              contentSpoilerLevel: "ENDING",
              label: "Исчезновение и поиски: комната, город, вода",
              measurement: { table: "window", id: "hes-gone" },
            },
            {
              id: "truman-article-window-wall",
              contentSpoilerLevel: "ENDING",
              label: "Стена, лестница, поиск выхода",
              measurement: { table: "window", id: "wall" },
            },
            {
              id: "truman-article-window-panic",
              contentSpoilerLevel: "MINOR",
              label: "Повторяющиеся прохожие и помятый жук на той же улице",
              measurement: { table: "window", id: "panic" },
            },
          ],
        },
        {
          kind: "paragraph",
          id: "truman-article-craft-4",
          text:
            "Эти монтажные сопоставления имеют ограниченный смысл: повторная проверка SHA-256 исходного файла не означает повторного запуска самого детектора. Измерения доступны рядом; они не описывают непрерывный звук и не заменяют чтения самой сцены.",
        },
        {
          kind: "paragraph",
          id: "truman-article-craft-5",
          text:
            "В выбранных окнах поиск героя даёт больше обнаруженных переходов, чем сцена у стены. Это ограниченное сравнение позволяет поставить содержательный вопрос: когда внимание зрителя распределяется между поиском и наблюдателями, а когда сосредоточивается на выборе одного человека? Обобщать измерение на весь фильм нельзя.",
          support: { evidenceIds: ["truman-ev-wall"] },
        },
      ],
    },
    {
      id: "truman-article-decision",
      number: 7,
      eyebrow: "07 / Решение",
      heading: "Дверь, море и поклон",
      standfirst:
        "Фильм ставит героя перед выбором, который нельзя выиграть: с одной стороны ложь с гарантиями, с другой — правда без обещаний. Разобрать этот выбор — значит посмотреть, что он знает, чем на него давят и что он теряет.",
      spoilerLevel: "ENDING",
      moduleIds: ["truman-mod-decision"],
      blocks: [
        {
          kind: "paragraph",
          id: "truman-article-decision-1",
          text:
            "Лодка встречает нарисованный горизонт. За этим наблюдением следует лестница и дверь. Вещи, которые могли быть отвлечёнными метафорами, становятся физическими условиями выбора: человеку предстоит решить, остаться ли в пространстве, устройство которого он наконец увидел.",
        },
        {
          kind: "illustration",
          id: "truman-article-illu-canvas",
          assetId: "illu-truman-caric-canvas",
          layout: "inset",
          caption:
            "Карикатура: он бьётся не в предел мироздания, а в натянутый холст — за холстом складной стул и термос. Рисунок, не кадр из фильма.",
        },
        {
          kind: "paragraph",
          id: "truman-article-decision-2",
          text:
            "К этому моменту у Трумана накопились основания не доверять знакомому миру. Но доказательство обмана не равно знанию о том, что ждёт снаружи. Финальный разговор ставит перед ним именно эту проблему: отсутствие гарантии будущего ещё не делает прежнее устройство жизни правомерным.",
          support: { evidenceIds: ["truman-ev-wall", "truman-ev-dialog"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-decision-3",
          text:
            "Море связывает финальный выбор с воспоминанием о гибели отца. Вернуться к прежнему порядку значило бы сохранить знакомое окружение, а продолжить путь — столкнуться со страхом и неизвестностью. Фильм не даёт нам точного отчёта о внутренних мотивах героя; зато делает цену выбора предметно различимой.",
          support: { evidenceIds: ["truman-ev-storm", "truman-ev-drowning"] },
        },
        {
          kind: "illustration",
          id: "truman-article-illu-storm",
          assetId: "illu-truman-caric-storm",
          layout: "inset",
          caption:
            "Карикатура: шторм — это шланг и ветродуй. В павильоне нет ни одного злого человека, и именно это страшнее всего. Рисунок, не кадр из фильма.",
        },
        {
          kind: "paragraph",
          id: "truman-article-decision-4",
          text:
            "На корме лодки видна надпись «SANTA MARIA». Она допускает ассоциацию с кораблём Колумба и путешествием за пределы известного, но сама по себе не доказывает авторского намерения. Смысл выбора не зависит от того, была ли эта параллель задумана.",
          support: { evidenceIds: ["truman-ev-setting-sail"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-decision-5",
          text:
            "Перед уходом герой кланяется. Утреннее приветствие, знакомое зрителю с начала картины, теперь соседствует с прощанием. Повтор получает новое значение: привычная публичная формула больше не обязана удерживать человека в привычной роли.",
          support: { evidenceIds: ["truman-ev-exit"] },
        },
        {
          kind: "pullquote",
          id: "truman-article-decision-pullquote",
          text: "Вопрос финала не «будет ли ему хорошо», а «будет ли он своим».",
        },
        {
          kind: "paragraph",
          id: "truman-article-decision-6",
          text:
            "Фильм не обещает Труману безошибочной жизни за пределами знакомого пространства. Он предлагает отличить неизвестность от права другого распоряжаться тобой. Уход важен не потому, что всякая свобода автоматически ведёт к добру, а потому, что обман лишал героя возможности ответственно выбирать.",
          support: { evidenceIds: ["truman-ev-nocamera", "truman-ev-trutalk"] },
        },
        {
          kind: "timeline",
          id: "truman-article-decision-anchors",
          items: [
            {
              id: "truman-article-anchor-setting-sail",
              timestampSeconds: 4981,
              label: "Корма лодки: название «SANTA MARIA» видно в кадре",
              evidenceId: "truman-ev-setting-sail",
              still: trumanArticleStills.santaMaria,
            },
            {
              id: "truman-article-anchor-storm",
              timestampSeconds: 5173.407,
              label: "Шторм против одного человека: «Тебе придётся меня убить!»",
              evidenceId: "truman-ev-storm",
            },
            {
              id: "truman-article-anchor-sail-number",
              timestampSeconds: 5235,
              label: "На парусе видно число 139; намеренная библейская отсылка не установлена",
              evidenceId: "truman-ev-sail-139",
              still: trumanArticleStills.sail139,
            },
            {
              id: "truman-article-anchor-decision-exit",
              timestampSeconds: 5691.316,
              label: "Утренняя формула в последний раз, поклон и шаг в проём EXIT",
              evidenceId: "truman-ev-exit",
              still: trumanArticleStills.exit,
            },
          ],
        },
      ],
    },
    {
      id: "truman-article-morality",
      number: 8,
      eyebrow: "08 / Нравственный счёт",
      heading: "Кто виноват и в чём",
      spoilerLevel: "ENDING",
      moduleIds: ["truman-mod-moral"],
      blocks: [
        {
          kind: "illustration",
          id: "truman-article-illu-tag",
          assetId: "illu-truman-caric-tag",
          layout: "inset",
          caption:
            "Карикатура: бирку поправляет не он. Человека оценивают по тому, что ему дали — дом, уют, безопасность, — а он стоит ровно и не возражает, потому что не знает, что попал в каталог. Рисунок, не кадр из фильма.",
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-1",
          text:
            "Устройство обмана распределено между создателем, сотрудниками и зрителями. По выборочным изображениям нельзя уверенно приписать каждому из них одни и те же чувства или мотивы.",
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-2",
          text:
            "В субтитрах интервью внешний мир назван больным, а Сихейвен — таким, каким мир должен быть. В контексте истории Кристофа это можно читать как оправдание власти заботой, но эти блоки не называют говорящего и не подтверждают интонацию или искренность. В эпизоде шторма забота как объяснение сталкивается с угрозой для жизни Трумана.",
          support: { evidenceIds: ["truman-ev-seahaven-design"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-3",
          text:
            "В словах о том, что человек предпочитает свою клетку, слышится довод в защиту устроенного мира. Его следует проверить не по предполагаемой искренности говорящего, а по условиям, в которых складывалось это предпочтение.",
          support: { evidenceIds: ["truman-ev-trutalk"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-4",
          text:
            "В субтитрах интервью говорится о способах удерживать героя на острове, а школьное воспоминание сталкивает мечту об исследовании с ответом, что исследовать уже нечего. Это не доказывает, что всякое желание Трумана было управляемым. Но делает недостаточным довод, будто его привычки сами по себе оправдывают ограничение свободы.",
          support: {
            evidenceIds: ["truman-ev-manufactured-limits", "truman-ev-nothing-left"],
          },
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-5",
          text:
            "Фраза о рождении в прямом эфире меняет меру происходящего: представление началось прежде, чем человек мог согласиться на участие. Поэтому нравственный вопрос относится не к одному неудачному решению в студии, а к устройству отношений с самого начала жизни.",
          support: { evidenceIds: ["truman-ev-born-live"] },
        },
        {
          kind: "illustration",
          id: "truman-article-illu-born",
          assetId: "illu-truman-caric-born",
          layout: "inset",
          caption:
            "Карикатура: кювез, устроенный как телевизор, и камера, стоящая ближе родни. Рисунок, не кадр из фильма.",
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-ownership",
          text:
            "Самое точное слово в этом счёте — не «обман», а «владение». Когда создатель объясняет, что человек родился в прямом эфире, он говорит о человеке так, как говорят о запущенном проекте: не «он живёт», а «он идёт». Библейски это не мелочь и не метафора: человек создан по образу Божию (Бытие 1:27), а значит не является ничьей собственностью — ни студии, ни благодетеля, ни даже собственного замысла о себе. Всё остальное в фильме — производные одного этого присвоения.",
          scriptureRefs: ["Бытие 1:27"],
          support: { evidenceIds: ["truman-ev-born-live"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-authority",
          text:
            "Второе — про власть. Кристоф описывает устроенный им мир как защиту; по выборочным материалам мы не устанавливаем его внутреннюю уверенность или чувства. В Писании мера власти иная: кто хочет быть первым, тот служит (Марк 10:43–44). Это позволяет спросить, остаётся ли заботой устройство, лишающее другого знания и выбора.",
          scriptureRefs: ["Марк 10:43–44"],
          support: { evidenceIds: ["truman-ev-seahaven-design", "truman-ev-manufactured-limits"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-audience",
          text:
            "Третье — про зрителей. Их участие в шоу можно сопоставить с притчей о добром самарянине, где священник и левит проходят мимо нуждающегося (Лука 10:31–32). Но зрители фильма не одинаковы: Сильвия пытается вмешаться, и доступная выборка не позволяет утверждать бездействие всех остальных.",
          scriptureRefs: ["Лука 10:31–32"],
          support: { evidenceIds: ["truman-ev-interviews"] },
        },
        { kind: "subhead", id: "truman-article-morality-subhead-grey", text: "Серые зоны" },
        {
          kind: "paragraph",
          id: "truman-article-morality-meryl",
          text:
            "Начнём с той, кого легче всего записать в злодеи. В кухонном эпизоде выборочные кадры показывают Мэрил с инструментами, а субтитры содержат рекламу какао и просьбу о помощи; автор и адресат реплик по этим материалам не установлены. Её участие в обмане и давление рабочей роли стоит рассматривать вместе, не угадывая по одному кадру чувства или намерения. Принцип «не суди по наружности, но суди судом праведным» (Иоанн 7:24) напоминает: оценивай поступок, не перечёркивая человека.",
          scriptureRefs: ["Иоанн 7:24"],
          support: { evidenceIds: ["truman-ev-cocoa-subtitles", "truman-ev-knife-tools", "truman-ev-knife-call"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-marlon",
          text:
            "В сцене дружбы напряжение между близостью и ролью остаётся открытым. Субтитры повторяют обещание не лгать, но не устанавливают, кто повторяет его, с какой интонацией и по чьей подсказке. Выборочные кадры не дают надёжного доступа к чувствам Марлона. Притча противопоставляет искреннее обличение лживому жесту (Притчи 27:6); здесь она помогает поставить вопрос о доверии, а не вынести приговор внутренней жизни друга.",
          scriptureRefs: ["Притчи 27:6"],
          support: { evidenceIds: ["truman-ev-marlon", "truman-ev-marlon-retake"] },
        },
        {
          kind: "illustration",
          id: "truman-article-illu-friend",
          assetId: "illu-truman-caric-friend",
          layout: "inset",
          caption:
            "Карикатура: рука на плече и карточка за спиной — вопрос о дружбе и роли. Рисунок, не кадр из фильма.",
        },
        {
          kind: "illustration",
          id: "truman-article-illu-shadows",
          assetId: "illu-truman-shadows",
          caption:
            "Иллюстрация: как выглядит серая зона. Трое обычных людей в тёплой комнате, и тени, которые больше людей и говорят то, что вежливость скрывает, — ценник, марионетка, клетка. Рисунок, не кадр из фильма.",
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-christof",
          text:
            "В английских субтитрах финального разговора на вопрос «Ничего не было настоящим?» следует ответ: «Ты был настоящим». Привязанность Кристофа и вера в собственные слова — возможное прочтение, а не установленный факт: эти блоки не называют говорящих, звук и интонацию мы не сверяли. Этически можно обсуждать патернализм без вывода о чувствах. Даже если забота искренна, она не устраняет вопрос о праве удерживать человека против его воли.",
          support: { evidenceIds: ["truman-ev-dialog", "truman-ev-seahaven-design"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-crew",
          text:
            "И те, кто в аппаратной: распределение работы позволяет обсуждать ответственность за общий результат. История экспериментов Милгрэма — возможная аналогия о подчинении авторитету, а не диагноз сотрудников шоу и не установленное объяснение их мотивов.",
          support: { evidenceIds: ["truman-ev-camera-count"] },
          contextSourceIds: ["src-milgram"],
        },
        {
          kind: "illustration",
          id: "truman-article-illu-shift",
          assetId: "illu-truman-caric-shift",
          layout: "inset",
          caption:
            "Карикатура: смена. Человек ест бутерброд и двигает ползунок молнии — не из злобы, а потому что это его работа. Рисунок, не кадр из фильма.",
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-character",
          text:
            "Важен и возможный отказ от роли: сказать «я не буду» или помочь другому выйти из обмана. Такой нравственный вопрос нельзя решить одним предположением о характере всех жителей Сихейвена.",
        },
        { kind: "subhead", id: "truman-article-morality-subhead-watch", text: "Созерцание вместо помощи" },
        {
          kind: "paragraph",
          id: "truman-article-morality-audience-action",
          text:
            "Фильм позволяет спросить, когда сочувствие не переходит в действие. Послание Иакова ставит похожий вопрос: что пользы от добрых слов без помощи нуждающемуся? (Иаков 2:15–16). Это аналогия, а не одинаковый приговор всем зрителям: их возможности и поступки различаются.",
          scriptureRefs: ["Иаков 2:15–16"],
          support: { evidenceIds: ["truman-ev-interviews", "truman-ev-routine"] },
        },
        {
          kind: "illustration",
          id: "truman-article-illu-row",
          assetId: "illu-truman-caric-row",
          layout: "inset",
          caption:
            "Карикатура: на экране рука над водой, в зале попкорн, и никто не встаёт. Рисунок, не кадр из фильма.",
        },
        {
          kind: "illustration",
          id: "truman-article-illu-watching",
          assetId: "illu-truman-watching",
          caption:
            "Иллюстрация: «Созерцание вместо помощи». В каждом окне свой экран, на каждом экране одна и та же рука над водой, и ни один человек в доме не встаёт. Рисунок, не кадр из фильма.",
        },
        {
          kind: "duel",
          id: "truman-article-duel-freedom",
          label: "Дуэль 03 · свобода",
          question: "Кто в этом фильме свободнее — тот, кто уходит, или тот, кто держит небо?",
          sides: [
            {
              id: "truman-article-duel-freedom-truman",
              label: "Труман",
              reading:
                "Он выбирает неизвестность: выходит за дверь, не зная, что там, и не получив гарантий. Свобода здесь оплачена отказом от единственного мира, который он знал.",
              evidenceIds: ["truman-ev-exit"],
            },
            {
              id: "truman-article-duel-freedom-christof",
              label: "Кристоф",
              reading:
                "Он управляет погодой, расписанием и небом, но не может заставить героя остаться иначе как силой, которую сам же называет заботой. Власть у него есть, и она кончается там, где герой выбирает дверь.",
              evidenceIds: ["truman-ev-storm"],
            },
          ],
          open:
            "Свободнее ли тот, кто выбирает, или тот, кто знает правила? Фильм не даёт ответа и не сводит счёт: он показывает, что власть над сценой не равна власти над человеком, и оставляет зрителя с этим разрывом.",
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-distance",
          text:
            "Исследователи, обращающиеся к Зигмунту Бауману, обсуждают моральную дистанцию: удалённость может ослаблять ощущение ответственности за другого. Применительно к фильму мы предлагаем аналогию, а не диагноз зрителей: экран приближает лицо Трумана, но не заставляет аудиторию действовать. Распределённая ответственность не означает, что у каждого зрителя был одинаковый выбор.",
          support: { evidenceIds: ["truman-ev-interviews"] },
          contextSourceIds: ["src-bauman"],
        },
        {
          kind: "illustration",
          id: "truman-article-illu-window",
          assetId: "illu-truman-caric-window",
          layout: "inset",
          caption:
            "Карикатура: восемь человек и один наклон головы. Никто ничего не решал, а наклонились все одинаково — и собака смотрит на людей, а не на экраны. Рисунок, не кадр из фильма.",
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-stupidity",
          text:
            "Бонхёффер в размышлении о глупости писал об утрате самостоятельности под давлением власти; здесь мы ссылаемся на опубликованный перевод, а не приписываем его выводы фильму. В картине попытку Сильвии предупредить Трумана прерывают. Аналогия с Бонхёффером помогает спросить, что делает свободу возможной, но не доказывает, что убеждение бесполезно во всех обстоятельствах.",
          support: { evidenceIds: ["truman-ev-sylvia", "truman-ev-wall"] },
          contextSourceIds: ["src-bonhoeffer"],
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-lie",
          text:
            "Гавел в эссе «Сила бессильных» использует вымышленного овощника, который выставляет лозунг из привычки и страха последствий; это пример, а не эпизод его биографии. Солженицын призывал к личному неучастию во лжи. Мы сопоставляем эти мысли с выбором Трумана, но различие существенно: герой долго не знает, что участвует в обмане. По доступным выборочным кадрам нельзя установить, каким окажется мир за дверью, или гарантировать, что там не будет лжи.",
          support: { evidenceIds: ["truman-ev-trutalk", "truman-ev-exit"] },
          contextSourceIds: ["src-havel", "src-solzhenitsyn"],
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-bridge",
          text:
            "Ответственность участников нельзя свести к одинаковому обвинению. У создателя, сотрудника, близкого человека и зрителя разные возможности и разное знание. Однако эти различия не отменяют общего вопроса: служит ли власть человеку или превращает его в средство?",
        },
        {
          kind: "timeline",
          id: "truman-article-morality-anchors",
          items: [
            {
              id: "truman-article-anchor-seahaven",
              timestampSeconds: 4052.5,
              label: "Создатель объясняет замысел: Сихейвен — то, каким мир должен быть",
              evidenceId: "truman-ev-seahaven-design",
              still: trumanArticleStills.christofMonitor,
            },
            {
              id: "truman-article-anchor-manufactured",
              timestampSeconds: 3842.5,
              label: "Производство признаётся: взрослея, героя удерживали придуманными способами",
              evidenceId: "truman-ev-manufactured-limits",
            },
            {
              id: "truman-article-anchor-nothing-left",
              timestampSeconds: 3847.7,
              label: "Школьный флешбэк: мальчику, который хочет стать исследователем, отвечают, что исследовать нечего",
              evidenceId: "truman-ev-nothing-left",
              still: trumanArticleStills.school,
            },
            {
              id: "truman-article-anchor-born-live",
              timestampSeconds: 5101.959,
              label: "На требование прекратить бурю звучит: он родился в прямом эфире",
              evidenceId: "truman-ev-born-live",
            },
          ],
        },
      ],
    },
    {
      id: "truman-article-biblical",
      number: 9,
      eyebrow: "09 / Библейская оптика",
      heading: "Подмена, а не аллегория",
      spoilerLevel: "ENDING",
      moduleIds: ["truman-mod-biblical"],
      blocks: [
        {
          kind: "paragraph",
          id: "truman-article-biblical-1",
          text:
            "Образ создателя, управляющего искусственным небом, приглашает к богословскому сравнению. Но Кристоф не является автоматически аллегорией Бога. Сначала нужно различить саму власть, её цели и её отношение к человеку.",
        },
        {
          kind: "paragraph",
          id: "truman-article-biblical-2",
          text:
            "Псалом 138:1–12 говорит о Божием знании, которое не является тайным сбором сведений о чужой жизни. Псалмопевец обращается к Господу, Который знает его и от Которого ничто не скрыто. Сопоставление с Кристофом обнаруживает прежде всего различие: ограниченное наблюдение человека не равно всеведению Бога, а контроль над средой не равен благому промыслу.",
          support: { evidenceIds: ["truman-ev-trutalk", "truman-ev-storm"] },
          scriptureRefs: ["Псалом 138:1–12"],
        },
        {
          kind: "paragraph",
          id: "truman-article-biblical-sail",
          text:
            "Lozier Institute сопоставляет название лодки «Санта-Мария» и номер 139 на парусе со словами Писания (Псалом 138:9–10). В самом фильме независимо подтверждены две надписи: «SANTA MARIA» на корме около 4981 с и «139» на парусе около 5235 с. Обе надписи видимы, но авторский замысел и намеренная библейская отсылка не установлены.",
          support: { evidenceIds: ["truman-ev-setting-sail", "truman-ev-sail-139"] },
          contextSourceIds: ["src-lozier"],
          scriptureRefs: ["Псалом 138:9–10"],
        },
        {
          kind: "paragraph",
          id: "truman-article-biblical-3",
          text:
            "Деяния 17:26–27 связывают пределы человеческого обитания с тем, чтобы люди искали Бога. В мире Трумана ограничение пространства становится способом удерживать человека в неведении. Это редакционное сопоставление разных целей, а не утверждение, что фильм иллюстрирует этот библейский текст.",
          support: { evidenceIds: ["truman-ev-manufactured-limits"] },
          scriptureRefs: ["Деяния 17:26–27"],
        },
        {
          kind: "paragraph",
          id: "truman-article-biblical-4",
          text:
            "Заповедь «не произноси ложного свидетельства» (Исход 20:16) заставляет серьёзно отнестись к обещанию друга и семейным объяснениям. В фильме проблема не в том, что человек не знает абсолютно всего, а в том, что значимые решения другого о его жизни основаны на систематическом обмане.",
          support: { evidenceIds: ["truman-ev-album", "truman-ev-reunion-amnesia"] },
          scriptureRefs: ["Исход 20:16"],
        },
        {
          kind: "paragraph",
          id: "truman-article-biblical-voice",
          text:
            "В финальных субтитрах записаны слова «Я — создатель телешоу», но текст не устанавливает говорящего или звучание. Если сцена подтвердит голос без видимого говорящего, его форму можно сопоставить с «голосом слов» (Второзаконие 4:12); это не доказательство богословской аллегории.",
          scriptureRefs: ["Второзаконие 4:12"],
          support: { evidenceIds: ["truman-ev-dialog"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-biblical-days",
          text:
            "И счёт. «День 10 909» — не титр для удобства: дни героя считают другие, и это, пожалуй, самое неприятное в фильме. Считать чьи-то дни — вообще занятие того, кто любит; в псалме они тоже сосчитаны, «в книге Твоей записаны все дни» (Псалом 138:16), — но сосчитаны знающим и любящим. Здесь счёт ведут те, кто смотрит: у них график, рейтинг и рекламные паузы. Разница между тем, чтобы быть знаемым, и тем, чтобы быть учтённым, — вот это и есть предмет фильма.",
          scriptureRefs: ["Псалом 138:16"],
          support: { evidenceIds: ["truman-ev-daycount"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-biblical-5",
          text:
            "С христианской точки зрения достоинство Трумана не создаётся вниманием публики и не исчезает, когда он перестаёт быть зрелищем. Человек — образ Божий, а не собственность зрителя или студии. Это основание нравственной оценки, не требующее объявлять героя безупречным.",
          support: { evidenceIds: ["truman-ev-nocamera"] },
        },
        {
          kind: "aside",
          id: "truman-article-biblical-aside",
          label: "К слову — и это уже не про фильм",
          text:
            "Если поставить рядом двух «создателей», разница видна не в силе, а в цели. Кристоф держит героя в неведении, потому что неведение удобно; Бог открывает, потому что истина освобождает (Иоанн 8:32). Кристоф поднимает бурю, чтобы человек не дошёл до выхода; буря, о которой говорит Писание, посылается с другой целью — чтобы очнуться и вернуться, а не утонуть (Иона 1:4). Кристоф запирает, и грех запирает так же, — а Христос выводит: «Я есмь дверь: кто войдёт Мною, тот спасётся» (Иоанн 10:9). Дверь в конце нарисованного неба хороша и без натяжек: она ведёт наружу. Разница только в том, что Евангелие называет, Кто эта дверь, и говорит, что за ней не пустота.",
          scriptureRefs: ["Иоанн 8:32", "Иона 1:4", "Иоанн 10:9"],
        },
        {
          kind: "timeline",
          id: "truman-article-biblical-anchors",
          items: [
            {
              id: "truman-article-anchor-cuesun",
              timestampSeconds: 4810.033,
              label: "«Включите солнце»: свет как команда, а не как утро",
              evidenceId: "truman-ev-cuesun",
            },
            {
              id: "truman-article-anchor-dialog",
              timestampSeconds: 5544.206,
              label: "Финальные субтитры: объяснение замысла шоу; звучание и говорящий не удостоверены",
              evidenceId: "truman-ev-dialog",
            },
            {
              id: "truman-article-anchor-nocamera",
              timestampSeconds: 5596.426,
              label: "Ответ героя: камеры в его голове никогда не было",
              evidenceId: "truman-ev-nocamera",
            },
          ],
        },
      ],
    },
    {
      id: "truman-article-verdict",
      number: 10,
      eyebrow: "10 / Вердикт",
      heading: "Вопрос остаётся",
      spoilerLevel: "FULL",
      moduleIds: ["truman-mod-final"],
      blocks: [
        {
          kind: "paragraph",
          id: "truman-article-verdict-1",
          text:
            "К финалу фильм возвращает вопрос из первой главы: кто определяет значение увиденного? Но теперь вопрос касается и нас. Мы тоже смотрели на жизнь другого человека, ждали объяснений и хотели узнать, чем закончится история.",
          support: { evidenceIds: ["truman-ev-exit"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-verdict-2",
          text:
            "Картина использует привлекательность зрелища, чтобы поставить зрелище под сомнение. В этом её художественная сила: зритель не находится полностью вне критикуемого мира, а сам переживает интерес к чужой судьбе. Такое противоречие не обязательно делает фильм безупречным, но делает его предметом серьёзного разговора.",
        },
        {
          kind: "paragraph",
          id: "truman-article-verdict-craft",
          text:
            "Стоит сказать и то, что теряется в спорах о смысле: визуальный язык картины заслуживает отдельного разговора. В интервью American Cinematographer оператор Питер Бизу описывает широкие объективы и маски для ощущения скрытой камеры; это не означает, что каждый необычный ракурс — камера шоу. В выборке возвращения отца есть объятие у моста наряду с аппаратной, экраном и зрителями; утверждать по ней, что весь эпизод — один неподвижный план, нельзя. Звуковую дорожку мы не проверяли.",
          support: { evidenceIds: ["truman-ev-reunion"] },
          contextSourceIds: ["src-asc-biziou"],
        },
        {
          kind: "paragraph",
          id: "truman-article-verdict-weakness",
          text:
            "И честная претензия, без которой разбор был бы рекламой. Устройство шоу не выдерживает бытовой проверки: чтобы тридцать лет прятать город, нужны не камеры, а невозможная дисциплина тысяч людей, каждый из которых молчит. Розенбаум назвал концепт «и умным, и глупым», и в этом он прав: фильм не отвечает на вопрос, как такое может работать, — он его обходит. Но обход сделан осознанно: это притча, а не инженерия, и в притче важна не герметичность декорации, а то, что она означает.",
        },
        {
          kind: "paragraph",
          id: "truman-article-verdict-3",
          text:
            "После судьбоносного выбора героя фильм возвращается к охранникам, которые смотрели эфир. В субтитрах звучит вопрос о том, что ещё идёт. В этой смене интереса заключён неприятный для нас финальный контраст: для Трумана событие связано со всей его жизнью, для аудитории оно может оказаться окончанием одной программы. Фильм обращает вопрос о потреблении чужой жизни к своему собственному зрителю.",
          support: { evidenceIds: ["truman-ev-guards"] },
        },
        {
          kind: "timeline",
          id: "truman-article-verdict-anchors",
          items: [
            {
              id: "truman-article-anchor-exit",
              timestampSeconds: 5691.316,
              label: "В проёме двери герой произносит свою утреннюю формулу в последний раз и кланяется",
              evidenceId: "truman-ev-exit",
            },
            {
              id: "truman-article-anchor-guards",
              timestampSeconds: 5755.382,
              label: "Охранники спрашивают, что ещё идёт, и тянутся к пульту",
              evidenceId: "truman-ev-guards",
            },
          ],
        },
        {
          kind: "paragraph",
          id: "truman-article-verdict-4",
          text:
            "В начале истории на тротуаре лежала вещь, для которой нашлось удобное объяснение. В конце мы уже знаем цену такого удобства. Труману понадобилась не способность подозревать всех подряд, а возможность самому отвечать за свою жизнь. И это возвращает вопрос нам: готовы ли мы любить другого человека, не присваивая себе права решать, какая правда ему доступна?",
        },
        {
          kind: "corrections",
          contentSpoilerLevel: "MINOR",
          id: "truman-article-corrections",
          caption:
            "Пять утверждений из пересказов: кухонный эпизод разделён на три проверяемые части. Опоры показывают отдельные изображения или текст субтитров, не непрерывную сцену. Ранее мы ошибочно отрицали сам эпизод с дождём; исправление сохранено.",
          rows: [
            {
              id: "truman-article-correction-rain",
              contentSpoilerLevel: "MINOR",
              commonClaim: "Дождь идёт только над Труманом и следует за ним",
              onScreen:
                "Эпизод есть: на доступном отдельном кадре Труман под узкой струёй. Прежнее отрицание самого эпизода было ошибкой. Отдельная проверка исходного MKV 4 ноября подтверждает расширение области дождя; старый кадр сам по себе этого не доказывает. Непрерывное движение и механизм эффекта по выборке не восстановить.",
              evidenceId: "truman-ev-rain",
            },
            {
              id: "truman-article-correction-knife",
              contentSpoilerLevel: "MAJOR",
              commonClaim: "Труман хватает нож или блистер",
              onScreen:
                "На одном отдельном кадре упаковка «Chef's Pal» лежит на столе, рядом видна рука. Кадр не устанавливает, чья рука, и не доказывает отсутствие ножа во всей сцене.",
              evidenceIds: ["truman-ev-knife"],
            },
            {
              id: "truman-article-correction-tools",
              contentSpoilerLevel: "MAJOR",
              commonClaim: "Кухонные инструменты держит только Труман",
              onScreen:
                "На отдельных кадрах Мэрил держит инструменты перед собой. Её намерение и непрерывный ход столкновения по этой выборке не установить.",
              evidenceIds: ["truman-ev-knife-tools"],
            },
            {
              id: "truman-article-correction-kitchen-text",
              contentSpoilerLevel: "MAJOR",
              commonClaim: "Весь рекламный текст относится к ножу",
              onScreen:
                "В английских субтитрах есть рекламный текст о какао и отдельно вопрос о нарезке и чистке. Субтитры и кадры сами по себе не устанавливают автора вопроса или интонацию; звук не сверяли.",
              evidenceIds: ["truman-ev-cocoa-subtitles", "truman-ev-tools-subtitles"],
            },
            {
              id: "truman-article-correction-headline",
              contentSpoilerLevel: "MINOR",
              commonClaim: "В пересказах на газетной полосе встречается «Who Needs Europe?»",
              onScreen:
                "На доступном отдельном кадре читается «CRACKDOWN ON HOMELESS — Enough is Enough!». Он не исключает другого заголовка и не устанавливает личность человека на фотографии.",
              evidenceId: "truman-ev-europe",
            },
            {
              id: "truman-article-correction-fingers",
              contentSpoilerLevel: "MINOR",
              commonClaim: "Скрещенные пальцы — на свадебной фотографии",
              onScreen:
                "Скрещенные пальцы — на кнопке «HOW'S IT GOING TO END?», которую герой прижимает к груди.",
              evidenceId: "truman-ev-fingers",
            },
            {
              id: "truman-article-correction-tunnel",
              contentSpoilerLevel: "ENDING",
              commonClaim: "FilmPlotHub утверждает, что Труман выбрался через подкоп под подвалом",
              onScreen:
                "Доступные выборочные наблюдения и текст субтитров об исчезновении не подтверждают этот способ, но и не доказывают отсутствия подкопа во всём фильме.",
              evidenceId: "truman-ev-escape",
            },
          ],
        },
      ],
    },
  ],
  closing: {
    heading: "Редакционная записка",
    text:
      "Текст опирается на данные о залоченном издании: 4 ноября 2026 года исходный MKV независимо пересчитан по SHA-256 и размеру — результат совпал с реестром. Несколько кадров и фрагментов оригинальной звуковой дорожки проверены выборочно; полного непрерывного просмотра со звуком это не заменяет. Основа каждой записи показана в реестре. Разбор опубликован 30 октября 2026 года. Подпись относится к исходному выпуску; новая редакция по задаче № 152 требует отдельной приёмки. Числа выводятся из записанного набора, а не набираются руками.",
  },
};
