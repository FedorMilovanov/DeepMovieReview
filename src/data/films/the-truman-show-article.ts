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
  kicker: "Разбор / залоченное издание",
  title: "Шоу Трумана: человек, который заметил камеру",
  standfirst:
    "Первый разбор «Глубоких вод» опирается на предоставленные измерения, отдельные кадры и субтитры. У каждой опоры указан материал проверки и его ограничения.",
  // The headline above already fits a tab; the standfirst does not fit a
  // snippet, so the visible standfirst stays long and the snippet says the same
  // thing shorter. Both are the article's own words, not a summary of it.
  seoTitle: "Шоу Трумана: человек, который заметил камеру",
  seoDescription:
    "Разбор «Шоу Трумана» по предоставленным измерениям, кадрам и субтитрам — с указанием оснований и границ проверки.",
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
      eyebrow: "01 / Метод",
      heading: "Что мы на самом деле смотрели",
      spoilerLevel: "NONE",
      moduleIds: ["truman-mod-sources"],
      blocks: [
        {
          kind: "paragraph",
          id: "truman-article-method-1",
          text:
            "Есть способ говорить о фильме, которым почти никто не пользуется: сначала измерить, потом истолковывать. Обычно бывает наоборот — сначала складывается впечатление, потом под него подбираются сцены. Проверить такой разбор нельзя, потому что он ни на что не указывает.",
        },
        {
          kind: "paragraph",
          id: "truman-article-method-2",
          text:
            "Основа разбора — измерения и записи, привязанные к конкретному носителю: в манифесте указаны Matroska, 1920×1080, частота 24000/1001, английская дорожка DTS, субтитры и контрольная сумма. Исходный файл здесь повторно не проверялся; часть сцен уточнена по отдельным кадрам предоставленных фрагментов. Такие кадры не заменяют непрерывный просмотр со звуком, а их таймкоды по манифесту приблизительны.",
        },
        {
          kind: "paragraph",
          id: "truman-article-method-3",
          text:
            "Первые записи указывают на разговор о герое ещё до его появления. По кадру и субтитрам можно обсудить, как фильм представляет замысел шоу; где именно находится говорящий и как звучит сцена, без отдельной проверки установить нельзя.",
          support: { evidenceIds: ["truman-ev-interviews"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-method-4",
          text: "Дальше в тексте — опорные точки, связанные с записями сцен. В реестре указан материал проверки или прямо сказано, что он не записан; статус реестра не заменяет просмотра всей сцены со звуком.",
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
          id: "truman-article-method-5",
          text:
            "И проверка сразу кое-что отняла. Несколько утверждений, которые кочуют по текстам о фильме, в самом фильме отсутствуют или выглядят иначе. Они исправлены по ходу текста и сведены в таблицу в конце — не как ритуал вежливости, а потому что каждое из них меняет смысл, а не только фактуру.",
        },
      ],
    },
    {
      id: "truman-article-machine",
      number: 2,
      eyebrow: "02 / История",
      heading: "Сюжет как машина, у которой нет режиссёра в кадре",
      spoilerLevel: "MINOR",
      moduleIds: ["truman-mod-story"],
      blocks: [
        {
          kind: "paragraph",
          id: "truman-article-machine-1",
          text:
            "Фильм не спешит показать героя. Сначала нам объясняют, зачем он нужен: публике надоели фальшивые эмоции актёров, а здесь человек, у которого эмоции настоящие. Только это говорит не автор, а продавец.",
          support: { evidenceIds: ["truman-ev-interviews"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-machine-2",
          text:
            "Дальше — день. Соседи, собака, машина, офис, приветствие по одной и той же словесной формуле. Повтор здесь не приём настроения, а улика: мир повторяется не потому, что так бывает, а потому что его повторяют. Сосед выходит в одно и то же время, потому что его выпускают.",
          support: { evidenceIds: ["truman-ev-greeting", "truman-ev-routine"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-machine-3",
          text:
            "И тут же — первая поломка. На улице оказывается студийный осветительный прибор с надписью Sirius. Текст субтитров передаёт объяснение: самолёт сбросил детали. Мир не молчит, когда ломается: для сбоя тут же находится версия. Кадр и текст — разные основания; звук отдельно не проверялся.",
          support: { evidenceIds: ["truman-ev-light", "truman-ev-light-explanation"] },
        },
        { kind: "subhead", id: "truman-article-rain-layers", text: "Одна сцена: дождь в четырёх слоях" },
        {
          kind: "paragraph",
          id: "truman-article-machine-rain",
          text:
            "Событие. В выбранном кадре у воды узкая струя дождя падает на Трумана. В других отмеченных кадрах он оказывается в стороне от неё, а затем дождь охватывает более широкое пространство.",
          support: { evidenceIds: ["truman-ev-rain"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-rain-form",
          text:
            "Форма. На опубликованном кадре светлая вертикаль струи отделяет согнувшегося героя от почти чёрного пространства вокруг. Этот контраст заметен в изображении; длительность и ритм монтажа по одному кадру не измерить.",
          support: { evidenceIds: ["truman-ev-rain"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-rain-meaning",
          text:
            "Смысл. Струю можно прочитать как маленькую ошибку мира, настроенного под одного человека: привычная погода внезапно выглядит адресной. Это толкование композиции, а не установленное намерение авторов.",
          support: { evidenceIds: ["truman-ev-rain"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-rain-limits",
          text:
            "Основание и предел. Доступны отдельный иллюстрирующий кадр и записи о выборочных изображениях; исходный мастер непрерывно со звуком не просмотрен. Поэтому мы не утверждаем, что туча следует за героем, и не восстанавливаем монтаж по одному стоп-кадру.",
          support: { evidenceIds: ["truman-ev-rain"] },
        },
        {
          kind: "timeline",
          id: "truman-article-machine-anchors",
          items: [
            {
              id: "truman-article-anchor-rain",
              timestampSeconds: 761,
              label: "Дождь падает узкой струёй на одного человека; он отходит — струя остаётся на месте",
              evidenceId: "truman-ev-rain",
              still: trumanArticleStills.rain,
            },
            {
              id: "truman-article-anchor-ghost",
              timestampSeconds: 910,
              label: "Человек, которого герой считает мёртвым, появляется в толпе — и его уводят силой",
              evidenceId: "truman-ev-ghost",
            },
            {
              id: "truman-article-anchor-radio",
              timestampSeconds: 1798.265,
              label: "Радио на чужой частоте диктует маршрут героя и командует статистами",
              evidenceId: "truman-ev-radio",
              still: trumanArticleStills.radio,
            },
            {
              id: "truman-article-anchor-elevator",
              timestampSeconds: 2110,
              label: "За дверью служебного лифта нет кабины: там коридор, по которому ходят люди со съёмочной группы",
              evidenceId: "truman-ev-elevator",
            },
          ],
        },
        {
          kind: "paragraph",
          id: "truman-article-machine-4",
          text:
            "Схема «объяснять вместо того, чтобы прятать» держится весь фильм и доходит до главного. Когда герой видит отца, газета, оказавшаяся у него в руках через минуту, не отрицает событие. Она переименовывает его: вместо пропавшего человека — проблема бездомных, вместо розыска — ответ на запрос публики. На фотографии при этом ровно та сцена, которую зритель только что видел своими глазами.",
          support: { evidenceIds: ["truman-ev-europe"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-machine-5",
          text: "Вот здесь у фильма появляется тезис, который сильнее любой антиутопии.",
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
            "Именно поэтому мир фильма кажется таким мирным. В нём почти ничего не запрещают: ему выдают объяснения, глянцевые страницы и плакаты о том, что путешествия опасны. Забор тут есть, но он не главный — главное то, что за забором, по версии плаката, всё уже случилось с кем-то другим.",
          support: { evidenceIds: ["truman-ev-poster"] },
        },
      ],
    },
    {
      id: "truman-article-cast",
      number: 3,
      eyebrow: "03 / Персонажи",
      heading: "Шесть человек, которые держат его небо",
      standfirst:
        "В этом фильме нет злодея: есть шесть профессионалов и один человек, который не знает, что он в кадре. Разница между ними не в доброте, а в том, чем каждый владеет — собой или ролью.",
      spoilerLevel: "MAJOR",
      moduleIds: ["truman-mod-characters"],
      blocks: [
        {
          kind: "paragraph",
          id: "truman-article-cast-1",
          text:
            "Фильм распределяет наше сочувствие как кастинг. Каждому из шести он даёт свою степень доступа к зрителю: кого-то показывает вплотную, кого-то — через монитор, кого-то — только голосом. Эта раздача и есть характеристика: персонаж в «Шоу Трумана» определяется не тем, что он за человек, а тем, сколько в нём осталось своего.",
        },
        {
          kind: "paragraph",
          id: "truman-article-cast-truman",
          text:
            "Герой хочет одного и говорит это прямым текстом: Фиджи, вырваться, посмотреть мир. Боится он воды — и это единственный страх в фильме, у которого есть автор: тонущий отец не случайность, а сценарий, придуманный, чтобы мальчик не выходил за мост. Противоречие героя в том, что его знает весь мир, а он об этом не знает. А самообман у него домашний, не злодейский: он годами уговаривает себя, что всё в порядке, и это «в порядке» держится на повторяющемся расписании.",
          support: { evidenceIds: ["truman-ev-fiji", "truman-ev-drowning", "truman-ev-manufactured-limits"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-cast-truman-2",
          text:
            "Подача у него — образец, и это важнее, чем кажется: фильм не смеётся над человеком, который тридцать лет не замечал очевидного. Приглашение к идентификации здесь сильное и устроено технически. Мы почти всегда на его стороне кадра — не потому, что он хороший, а потому, что нам не оставили другого места: смотреть вместе с камерами и переживать вместе с ним.",
        },
        {
          kind: "paragraph",
          id: "truman-article-cast-christof",
          text:
            "Кристоф — противоположный случай: предостережение с почти нулевым приглашением к идентификации. Говорит он чаще всего не в диалоге, а сверху — как голос, распоряжающийся светом и погодой. Верен он не человеку, а замыслу — миру, каким тот должен быть. Отсюда его логика: всё, что он делает, он делает для героя, а всё, что герой хочет, объявляет ошибкой проекта.",
          support: { evidenceIds: ["truman-ev-seahaven-design", "truman-ev-interviews"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-cast-meryl",
          text:
            "Мэрил — неудобный персонаж фильма: она играет жену по контракту и во время ссоры рекламирует какао. Её участие в обмане можно объяснять рабочей ролью, но по кадрам нельзя достоверно восстановить её мысли. В субтитрах сцены есть просьба о помощи; её адресат и мотив требуют отдельной проверки.",
          support: { evidenceIds: ["truman-ev-mococoa", "truman-ev-knife-call"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-cast-marlon",
          text:
            "Марлон устроен тоньше, и фильм выдаёт его одной деталью. Его обещание — «последнее, что я стал бы делать, это врать тебе» — дважды почти дословно записано в субтитрах. Мы не утверждаем, что это переснятый дубль: по субтитрам нельзя надёжно установить, кто и зачем повторяет фразу, а звук мы не сверяли. Установлено другое — повтор есть, и он соседствует с кадрами аппаратной. Этого достаточно, чтобы доверие друга перестало быть только доверием и стало ещё и материалом эфира.",
          support: { evidenceIds: ["truman-ev-marlon-retake"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-cast-sylvia",
          text:
            "Сильвия — образец и одна из самых коротких ролей в фильме. Она единственная говорит герою правду в лицо и единственная, кого после этого убирают из его мира. Её линия пунктирна: девушка с Фиджи в начале, звонящая в студию в конце, — а между этими точками её нет. Фильм тем самым показывает цену правды точнее, чем любым монологом: сказавшего её просто вырезают из кадра.",
          support: { evidenceIds: ["truman-ev-sylvia", "truman-ev-trutalk"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-cast-mother",
          text:
            "Мать — смешанный случай, где нежность и служебная обязанность неразличимы. Она обнимает сына как мать и тут же раскрывает альбом на нужной странице, чтобы тревога улеглась. Вопрос, который фильм оставляет без ответа: она верит, что участвует в материнстве, или знает, что участвует в смене?",
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
              label: "Единственная правда, сказанная в лицо: «Это фальшивка. Всё это для тебя. Небо…»",
              evidenceId: "truman-ev-sylvia",
            },
            {
              id: "truman-article-anchor-album",
              timestampSeconds: 2222.262,
              label: "Мать задерживается на странице альбома, чтобы тревога сына улеглась",
              evidenceId: "truman-ev-album",
            },
            {
              id: "truman-article-anchor-marlon-retake",
              timestampSeconds: 3459.2,
              label: "Обещание повторяется в субтитрах почти дословно; фильм показывает аппаратную",
              evidenceId: "truman-ev-marlon-retake",
              still: trumanArticleStills.monitor,
            },
          ],
        },
        {
          kind: "paragraph",
          id: "truman-article-cast-2",
          text:
            "Отсюда — правило, по которому фильм строит весь свой моральный счёт: симпатия достаётся не добрым, а тем, кто не играет. Кристоф искренен, но играет; Мэрил устала, но играет; Марлон симпатичен, но играет; Сильвия играла бы, если бы осталась, — и её убрали. Единственный, кто не играет, — тот, кто не знает, что участвует в представлении, и именно его камера любит больше всех.",
        },
      ],
    },
    {
      id: "truman-article-bonds",
      number: 4,
      eyebrow: "04 / Связи",
      heading: "Три контракта вместо трёх отношений",
      standfirst:
        "У брака есть спонсор, у дружбы — рабочая смена, у возвращения отца — место в эфирной сетке. Это не отменяет возможных чувств, но делает условия близости неравными.",
      spoilerLevel: "MAJOR",
      moduleIds: ["truman-mod-relationship", "truman-mod-friendship"],
      blocks: [
        {
          kind: "paragraph",
          id: "truman-article-bonds-1",
          text:
            "Три близкие связи героя можно рассмотреть как договоры, в которых одна сторона знает условия, а другая — нет. Такая оптика не снимает ответственности с участников и не позволяет определить их чувства; она помогает спросить, кто платит за видимую близость и кто не знает её цены.",
        },
        { kind: "subhead", id: "truman-article-bonds-marriage-head", text: "Брак, у которого есть спонсор" },
        {
          kind: "paragraph",
          id: "truman-article-bonds-marriage",
          text:
            "Ссора на кухне — сцена, где брак перестаёт притворяться. Труман требует объяснений; Мэрил вместо ответа показывает банку какао и начинает рекламную речь. Позже она держит перед собой кухонные инструменты, а он удерживает её. По отдельным кадрам нельзя определить намерение её жеста: в конфликте действуют оба. Разговор, который должен быть личным, оказывается обращён к кому-то ещё.",
          support: { evidenceIds: ["truman-ev-mococoa", "truman-ev-knife", "truman-ev-knife-tools", "truman-ev-meryl-held"] },
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
            "В субтитрах сцены появляется просьба «Сделай же что-нибудь!». Её можно понимать как обращение к создателям шоу, но по отдельным кадрам нельзя установить адресата или решить, что движет Мэрил: страх, усталость от роли или потеря контроля. Труман при этом удерживает её — физическое действие нельзя вычеркнуть из разбора.",
          support: { evidenceIds: ["truman-ev-knife-tools", "truman-ev-knife-call", "truman-ev-meryl-held"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-bonds-marriage-3",
          text:
            "Рекламную реплику Мэрил можно прочитать как обращение к невидимой аудитории посреди личного конфликта. Выборочные кадры показывают и кухонные предметы, и изображение участников на мониторе, но не восстанавливают непрерывный переход или точный адрес каждой реплики.",
          support: { evidenceIds: ["truman-ev-mococoa", "truman-ev-knife-tools", "truman-ev-meryl-held"] },
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
              label: "Мэрил → кто-то за сценой",
              reading:
                "Просьбу «Сделай же что-нибудь!» можно читать как обращение к создателям шоу. Субтитр и отдельный кадр сами по себе не устанавливают адресата.",
              evidenceIds: ["truman-ev-knife-call"],
            },
          ],
          open:
            "Кого она зовёт и что именно её сломало — страх, усталость от роли или потеря контроля над сценой? Последний адресат остаётся возможным прочтением, а не подтверждённым фактом.",
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
            "Дружба героя устроена тоньше. В разговоре о Фиджи рядом с мечтой Трумана появляется рекламная реплика о пиве. Это соседство можно читать как близость, которую шоу превращает в товар, или как безупречно сыгранную близость. Текст реплик сам по себе не решает, насколько искренен Марлон.",
          support: { evidenceIds: ["truman-ev-beer"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-bonds-friendship-2",
          text:
            "Обещание — «последнее, что я стал бы делать, это врать тебе» — дважды записано в субтитрах почти теми же словами. Выборочные кадры показывают Марлона и Трумана на мосту, но не устанавливают непрерывный монтаж между репликами. Без сверки звука нельзя сказать, кто произносит повтор и как он звучит. Можно прочитать разговор и как поддержку друга, и как часть управляемого представления; искренность Марлона остаётся открытой.",
          support: { evidenceIds: ["truman-ev-marlon", "truman-ev-marlon-retake"] },
        },
        {
          kind: "duel",
          id: "truman-article-duel-promise",
          label: "Дуэль 02 · одно обещание",
          question: "Это разговор двух друзей или фрагмент управляемого представления?",
          sides: [
            {
              id: "truman-article-duel-promise-hears",
              label: "Чтение как дружбы",
              reading:
                "Обещание не лгать можно прочитать как попытку сохранить доверие: для Трумана слово друга имеет вес. Это интерпретация отношений, а не доказательство чувств Марлона.",
              evidenceIds: ["truman-ev-marlon"],
            },
            {
              id: "truman-article-duel-promise-sees",
              label: "Чтение как части шоу",
              reading:
                "Разговор происходит в устроенном для эфира мире. Можно усомниться в свободе друга говорить за себя, но два похожих фрагмента субтитров сами по себе не доказывают ни подсказку, ни монтаж между ними.",
              evidenceIds: ["truman-ev-marlon-retake"],
            },
          ],
          open:
            "Можно ли из повтора заключить, что Марлон ничего не чувствует? Нет. Запись фиксирует повтор в субтитрах — две почти дословные строки подряд; кто из двоих что произносит и как это звучит, без сверки звука не установить. Это наблюдение о тексте, а не доказательство того, что разговор «производится», и оно ничего не говорит о том, что друг чувствует. Поэтому мы не ставим ему оценку за дружбу.",
        },
        {
          kind: "paragraph",
          id: "truman-article-bonds-friendship-3",
          text:
            "В отдельных кадрах возвращения отца видны объятие у ограждения моста и позднее изображение на мониторе аппаратной; непосредственный переход между ними по этой выборке не восстановить. Сам разговор Марлона с Труманом происходит внутри управляемого эфира, но проверенные кадры встречи не устанавливают, какую роль Марлон сыграл в её организации.",
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
            "Третья связь — с создателем — устроена иначе: это уже не договор, а односторонняя зависимость. Кристоф знает о нём всё, он о Кристофе — ничего. Разговор об этой паре стоит отдельно, в разделе о решении, потому что там она перестаёт быть отношением и становится выбором.",
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
              label: "Жена отворачивается к камере и рекламирует какао посреди ссоры",
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
              label: "В субтитрах: «Сделай же что-нибудь!»; адресат требует проверки",
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
              label: "Обещание повторяется в субтитрах; фильм показывает аппаратную",
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
            "Отсюда простая мысль, которую фильм проводит без нажима: ложь в нём — не свойство человека, а условие занятости. Мэрил не злая, Марлон не подлец, мать не чудовище. Просто каждая из этих связей оплачена, а оплата проходит через того, кто об этом не знает.",
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
            "В подвале, где герой разбирает бумаги, его рука прижимает к груди круглую кнопку с вопросом «Ну и чем это кончится?» — и пальцы на ней скрещены. Кнопку он не покупал: она от того самого шоу, в котором он живёт. Скрещенные пальцы — жест, которым в детстве врут «я не вру». Человек держит у сердца вопрос о финале и одновременно просит прощения за то, что задаёт его.",
          support: { evidenceIds: ["truman-ev-fingers"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-props-button-2",
          text:
            "В пересказах этот жест часто приписывают свадебному снимку. Но скрещенные пальцы в фильме — на кнопке самого героя, у него в руках, в подвале, где он разбирает бумаги. Разница не косметическая: там жена врёт мужу, здесь человек врёт себе, что ещё может не знать ответа.",
        },
        { kind: "subhead", id: "truman-article-props-grater-head", text: "Инструменты" },
        {
          kind: "paragraph",
          id: "truman-article-props-grater",
          text:
            "Сцену срыва часто пересказывают так: Труман хватает нож. В проверенных отдельных кадрах видна другая деталь: на столе лежит упаковка «Chef's Pal», а позднее Мэрил держит кухонные инструменты перед собой. Рядом с конфликтом она рекламирует какао «Мококея» — напиток, а не инструмент. Эти выборочные кадры не доказывают, что во всей сцене нет ножа, и сами по себе не устанавливают, кто произносит ту или иную реплику.",
          support: { evidenceIds: ["truman-ev-mococoa", "truman-ev-knife", "truman-ev-knife-tools"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-props-grater-2",
          text:
            "В субтитрах появляется просьба «Сделай же что-нибудь!», но её адресат требует отдельной проверки. По кадрам видны и предмет в руках Мэрил, и то, как Труман её удерживает; намерения нельзя установить одной неподвижной картинкой. Это одновременно сцена рекламного реквизита и конфликта двух людей, и сводить её к одному смыслу было бы удобнее, чем честнее.",
          support: { evidenceIds: ["truman-ev-knife-tools", "truman-ev-knife-call", "truman-ev-meryl-held"] },
        },
        { kind: "subhead", id: "truman-article-props-ladder-head", text: "Лестница" },
        {
          kind: "paragraph",
          id: "truman-article-props-ladder",
          text:
            "В финале лодка бьётся в нарисованный горизонт, и герой идёт вдоль стены. Стена оказывается небом, у которого стоит лестница. Эту сцену почти три десятилетия читают как «небо оказалось стеной». Верно — и слабее того, что есть в кадре. В кадре не тупик, а декорация со служебным входом: у края мира есть стремянка, потому что кто-то красит небо. Человек упирается не в предел мироздания, а в рабочее место маляра.",
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
              label: "Посреди ссоры жена поворачивается к камере и рекламирует какао",
              evidenceId: "truman-ev-mococoa",
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
              label: "В субтитрах: «Сделай же что-нибудь!»; адресат не назван",
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
            },
          ],
        },
      ],
    },
    {
      id: "truman-article-craft",
      number: 6,
      eyebrow: "06 / Ремесло",
      heading: "Что показал счёт — и чего он не показал",
      standfirst:
        "Скрытые камеры, виньетки, эффект подглядывания: об этом фильме легко говорить готовыми формулами. Попробуем сравнить конкретные эпизоды и заодно проверить, чего автоматический подсчёт переходов и строк субтитров не может доказать.",
      spoilerLevel: "ENDING",
      moduleIds: ["truman-mod-craft"],
      blocks: [
        {
          kind: "measurement",
          id: "truman-article-craft-totals",
          measurement: { table: "totals", id: "master" },
          text:
            "По ранее полученному отчёту детектор кадровой разницы обработал весь исходный файл; сам файл здесь повторно не проверялся. Рядом — число найденных переходов и записей в английских субтитрах; одна запись не обязательно равна одной реплике.",
        },
        {
          kind: "paragraph",
          id: "truman-article-craft-1",
          text:
            "В среднем детектор находит примерно один переход на шесть секунд экрана. Сравнение отдельных окон интереснее среднего, но обнаруженные переходы не равны полному монтажному листу.",
        },
        {
          kind: "measurement",
          id: "truman-article-craft-hold-father",
          measurement: { table: "hold", id: "hold-01" },
          text:
            "Самый длинный интервал без обнаруженного перехода расположен во время разговора с Марлоном, а не в сцене объятия с отцом. Проверенные отдельные кадры внутри этого интервала показывают разные планы Марлона и Трумана: детектор действительно пропустил смены, поэтому назвать его монтажной паузой было бы ошибкой.",
        },
        {
          kind: "measurement",
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
            "В этих окнах детектор не отметил переходов выше порога. Это не доказательство непрерывного плана: в кадрах с Марлоном видны пропущенные смены планов, а в библиотеке меняются ракурс и участники. Выборка отдельных кадров не заменяет непрерывный просмотр или полный монтажный лист.",
        },
        {
          kind: "measurement",
          id: "truman-article-craft-silence",
          measurement: { table: "silence", id: "silence-01" },
          text:
            "А теперь переворот того же приёма. Самый длинный отрезок без единой строки субтитров приходится на финал: у края нарисованного неба детектор продолжает находить переходы, а строк текста в окне нет вовсе. Строка субтитров — не речь: без дорожки звука это утверждение о субтитрах, а не о тишине в кадре.",
          support: { evidenceIds: ["truman-ev-wall"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-craft-3",
          text:
            "Отсутствие строк субтитров не доказывает тишину: звук этого окна мы не проверяли. Как интерпретация, пустота финала может противопоставляться движению монтажа. Когда герой остаётся один, эфир перестаёт быть заполненным, и в этой пустоте нет ничего, что можно продать. Свобода в фильме выглядит как рекламная пауза, из которой убрали рекламу.",
        },
        {
          kind: "measurement-table",
          id: "truman-article-craft-windows",
          caption: "Четыре окна, в которых видно, как фильм дышит.",
          columns: ["Момент", "Переходы", "Строки субтитров"],
          rows: [
            {
              id: "truman-article-window-library",
              label: "Библиотека: Труман, посетители и девушка в красном",
              measurement: { table: "window", id: "library" },
            },
            {
              id: "truman-article-window-hes-gone",
              label: "Побег и поиски: пустая кровать, город, вода",
              measurement: { table: "window", id: "hes-gone" },
            },
            {
              id: "truman-article-window-wall",
              label: "Стена, лестница, поиск выхода",
              measurement: { table: "window", id: "wall" },
            },
            {
              id: "truman-article-window-panic",
              label: "Повторяющиеся прохожие и помятый жук на той же улице",
              measurement: { table: "window", id: "panic" },
            },
          ],
        },
        {
          kind: "paragraph",
          id: "truman-article-craft-4",
          text:
            "Оговорка, без которой эти числа были бы ложью: детектор ловит скачки кадровой разницы, а длинный наплыв может пройти ниже порога и прочитаться как один непрерывный кусок. Поэтому мы пишем «обнаруженный переход», а не «склейка» в смысле окончательного монтажного листа. По предоставленному отчёту числа выше относятся к полному разрешению; ранний прогон по уменьшенной копии дал немного больше переходов. Сравнение зависит от условий обработки и не доказывает изменчивость фильма.",
        },
        {
          kind: "paragraph",
          id: "truman-article-craft-5",
          text:
            "Считая по окнам: на улице с повторяющимися прохожими детектор находит переходы в несколько раз чаще, чем у стены под нарисованным небом, а средняя по фильму лежит между этими плотностями. Разница не про смысл, а про плотность смены изображения. Максимальный темп за весь фильм из четырёх выбранных окон не выводится; держится более скромный вывод: в этих выбранных окнах показанный поисковый эпизод смонтирован плотнее, чем сцена у стены. Обобщать это правило на весь фильм нельзя.",
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
            "Свободу в этом фильме можно потрогать: она сделана из фанеры. Сначала горизонт оказывается панелью, потом в панели обнаруживается дверь, а над дверью звучит голос. Всё, что в другом кино было бы метафорой, здесь стоит в декорации — и потому выбор героя разыгран не в монологе, а в пространстве: между лестницей, морем и проёмом с надписью EXIT.",
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
            "К моменту выбора он знает немного. Небо — краска. Шторм, который его чуть не убил, был чьим-то решением. Мир вокруг — съёмочная площадка, и в ней тридцать лет играли люди, которых он считал близкими. И ровно в этот момент ему предлагают контраргумент: снаружи, мол, не больше правды, чем здесь. Проверить это он не может никак — ни один человек не приносил ему свидетельства о внешнем мире. Выбор поэтому не между известным добром и известным злом, а между проверенной ложью и непроверяемым остальным.",
          support: { evidenceIds: ["truman-ev-wall", "truman-ev-dialog"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-decision-3",
          text:
            "Давят на него со всех сторон сразу. Угрозой — только что показали, на что способна система. Голосом — он говорит не как начальник, а как обиженный близкий, у которого тридцать лет отношений и все права на них. Толпой — за ним смотрят, и уйти придётся на глазах у всех. И собственным страхом: вода, которая забрала отца, — единственное, чего он боится по-настоящему, и именно по воде лежит путь наружу. К этому добавляется то, что он теряет: дом, привычку, единственную семью, какую знает. Фильм не делает уход дешёвым.",
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
            "И всё-таки он не бежит — он отплывает. На корме его парусника читается имя «Санта-Мария»: то же, что у корабля, с которого началось открытие нового света. Всю жизнь ему объясняли, что за горизонтом искать нечего; он выходит в море на лодке, названной в честь первооткрывателя, — и это единственная шутка, которую фильм позволяет себе в самый серьёзный момент.",
          support: { evidenceIds: ["truman-ev-setting-sail"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-decision-5",
          text:
            "А потом он делает то, чего от него никто не ждал: кланяется. Последнее, что герой совершает внутри шоу, — жест артиста на поклон, и только после него он шагает в дверь. Свобода здесь не бунт против формы, а другое её употребление: он берёт единственную грамматику, которая у него есть, — грамматику эфира — и пользуется ею, чтобы из эфира выйти. Поэтому финал и не звучит как победа: это не разгром студии, а корректно закрытое выступление.",
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
            "Наш ответ на этот выбор — с оговоркой, без которой он был бы дешёвым. Уход оправдан не потому, что снаружи ждёт счастье: фильм этого не обещает и не показывает. Он оправдан потому, что человек, которому не доверяют его собственную жизнь, перестаёт быть человеком раньше, чем выйдет за дверь. В интервью про него говорят, что он предпочитает свою клетку; в финале он эту фразу опровергает — не словами, а шагом.",
          support: { evidenceIds: ["truman-ev-nocamera", "truman-ev-trutalk"] },
        },
        {
          kind: "timeline",
          id: "truman-article-decision-anchors",
          items: [
            {
              id: "truman-article-anchor-setting-sail",
              timestampSeconds: 4970,
              label: "Парусник «Санта-Мария» выходит в открытое море",
              evidenceId: "truman-ev-setting-sail",
            },
            {
              id: "truman-article-anchor-storm",
              timestampSeconds: 5173.407,
              label: "Шторм против одного человека: «Тебе придётся меня убить!»",
              evidenceId: "truman-ev-storm",
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
            "Фильм не делает вид, что зло выглядит как зло. В нём нет ни одного злодея с чёрными глазами — только профессионалы, каждый из которых делает свою работу хорошо и уверен, что делает её для чьего-то блага.",
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-2",
          text:
            "Кристоф не садист. Он искренне считает, что подарил человеку рай, и говорит это в эфире: мир, в котором вы живёте, — больной, а Сихейвен — то, каким мир должен быть. Когда героя уносит штормом, Кристоф не отдаёт команду прекратить, пока человек не оказывается на грани гибели, — и только тогда отпускает погоду.",
          support: { evidenceIds: ["truman-ev-seahaven-design"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-3",
          text:
            "Его оправдание сформулировано честно: человек может уйти в любой момент, он предпочитает свою клетку. Это правда ровно наполовину, и вторая половина важнее.",
          support: { evidenceIds: ["truman-ev-trutalk"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-4",
          text:
            "Герой не мог захотеть уйти, потому что желание уходить тоже было срежиссировано. Производство говорит об этом прямым текстом: пока он рос, придумывали способы удержать его на острове. А в школьном флешбэке мальчик, мечтающий стать исследователем, слышит в ответ, что исследовать больше нечего. Отказ от мира вложен в него до всякого выбора — и потом этот отказ называют его собственным.",
          support: {
            evidenceIds: ["truman-ev-manufactured-limits", "truman-ev-nothing-left"],
          },
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-5",
          text:
            "И ещё одна вещь, которую в этом фильме произносят без всякой иронии: он родился в прямом эфире. Человек здесь не субъект, у которого есть биография, а актив, у которого есть дата запуска.",
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
            "Второе — про власть. Кристоф ведёт себя как правитель, уверенный, что вправе распоряжаться чужой жизнью, потому что он же её и устроил: дал дом, работу, жену, безопасность. В Писании мера власти обратная: кто хочет быть первым, тот служит (Марк 10:43–44), а не распоряжается. По этой мерке Кристофа легко проверить: каждое его действие делает человеку удобнее жить в клетке, и ни одно не расширяет его свободу. Это не тирания злодея — это самая убедительная из тираний, та, что называет себя заботой.",
          scriptureRefs: ["Марк 10:43–44"],
          support: { evidenceIds: ["truman-ev-seahaven-design", "truman-ev-manufactured-limits"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-audience",
          text:
            "Третье — про зрителей, и оно уже про нас. Никто из них ничего не сделал: они смотрели — с восторгом, с умилением, не вставая с дивана. В притче о добром самарянине священник и левит прошли мимо, не причинив вреда (Лука 10:31–32), — и оказались виноваты ровно этим. Сихейвен держится не на камерах, а на том, что мир предпочёл смотреть: без зрителей шоу закрылось бы, а не наоборот.",
          scriptureRefs: ["Лука 10:31–32"],
          support: { evidenceIds: ["truman-ev-interviews"] },
        },
        { kind: "subhead", id: "truman-article-morality-subhead-grey", text: "Серые зоны" },
        {
          kind: "paragraph",
          id: "truman-article-morality-meryl",
          text:
            "Начнём с той, кого легче всего записать в злодеи. Жена — не сообщница в преступлении, а сотрудница по контракту: она рекламирует какао «Мококея» посреди ссоры, держит перед собой кухонные инструменты; в субтитрах сцены появляется просьба о помощи, адресат которой не установлен. Осудить её легко. Но при этом она сама живёт в чужом сценарии: роль, график, реплики, невозможность уйти. Она одновременно и то, что делает зло, и то, что этим злом ограничено. Отсюда правило, которое в Писании сказано короче: не суди по наружности, но суди судом праведным (Иоанн 7:24) — то есть оценивай поступок, не перечёркивая человека.",
          scriptureRefs: ["Иоанн 7:24"],
          support: { evidenceIds: ["truman-ev-mococoa", "truman-ev-knife", "truman-ev-knife-tools"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-marlon",
          text:
            "Друг — самый неприятный случай, потому что он единственный, кому хоть что-то стоит совести. На мосту он говорит то, что ему подсказывают, — и в этот момент в его лице действительно что-то дрожит. Он в этом с семи лет: вырос внутри шоу, как вырастают внутри семьи, и, вероятно, никогда не выбирал. Его дружба с героем — единственная близость, которая у героя есть, и одновременно главный инструмент удержания. Притча говорит об этом без утешения: искренни укоризны от любящего, а поцелуи ненавидящего лживы (Притчи 27:6). Здесь поцелуи искренние и всё равно лживые.",
          scriptureRefs: ["Притчи 27:6"],
          support: { evidenceIds: ["truman-ev-marlon", "truman-ev-marlon-retake"] },
        },
        {
          kind: "illustration",
          id: "truman-article-illu-friend",
          assetId: "illu-truman-caric-friend",
          layout: "inset",
          caption:
            "Карикатура: рука на плече и карточка за спиной — в одном человеке, и обе искренние. Рисунок, не кадр из фильма.",
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
            "Создатель — не садист и не циник. Он говорит с героем с неба и в какой-то момент произносит: «Ты был настоящим». Он говорит это человеку, которого только что чуть не утопил, и, судя по интонации, верит себе. Здесь и лежит его серость: он действительно привязан, действительно считает, что спасает, и именно поэтому непоправим. Этическая традиция называет такое патернализмом и спорит о нём со времён Милля: вмешиваться в чужую жизнь позволено, чтобы предотвратить вред другим, а не ради блага самого человека против его воли. Кристоф нарушает ровно вторую половину правила — и делает это с любовью, что хуже, чем с расчётом.",
          support: { evidenceIds: ["truman-ev-dialog", "truman-ev-seahaven-design"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-crew",
          text:
            "И те, кто в аппаратной. Они не мучители: они на смене. Кто-то сводит погоду, кто-то держит камеру, кто-то подаёт реплику в микрофон — работа как работа. Психология знает это состояние точнее, чем мораль: в опытах Милгрэма обычные люди доходили до последнего деления на шкале, потому что за них решали и потому что дело казалось важным. Кино не требует от них злодейства — оно требует только смены, и в этом его самый неприятный вывод: для Сихейвена не нужны плохие люди, нужны занятые.",
          support: { evidenceIds: ["truman-ev-camera-count"] },
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
            "Что всё это говорит о человеке? Не то, что он зол. Фильм последовательно показывает другое: люди преданы не истине и не друг другу, а своей роли — и в роли бывают добрыми, весёлыми, заботливыми. Характер проверяется не в больших решениях, а в маленьком отказе: сказать «я не буду», выйти из кадра, снять руку с пульта. В Сихейвене такого отказывающегося почти нет — и не потому, что там живут хуже нас, а потому, что это и есть его конструкция.",
        },
        { kind: "subhead", id: "truman-article-morality-subhead-watch", text: "Созерцание вместо помощи" },
        {
          kind: "paragraph",
          id: "truman-article-morality-audience-action",
          text:
            "Но самый сильный обвинительный пункт фильма адресован не студии. Миллионы людей смотрят и — впервые за всю историю — чувствуют: плачут, болеют за героя, спорят с экраном. И ничего не делают. Чувство здесь не ступень к действию, а его замена: аудитория переживает ровно столько, чтобы ей не нужно было вмешиваться. Апостол описывает этот механизм без всякой социологии: если брат или сестра наги и не имеют дневного пропитания, а кто-то скажет им «идите с миром», но не даст нужного — что пользы? (Иаков 2:15–16). Вся конструкция шоу держится на этой подмене: сочувствие как способ не помогать.",
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
            "Гавел в эссе «Сила бессильных» использует вымышленного овощника, который выставляет лозунг из привычки и страха последствий; это пример, а не эпизод его биографии. Солженицын призывал к личному неучастию во лжи. Мы сопоставляем эти мысли с выбором Трумана, но различие существенно: герой долго не знает, что участвует в обмане. Фильм не показывает, каким окажется мир за дверью, и не гарантирует, что там не будет лжи.",
          support: { evidenceIds: ["truman-ev-trutalk", "truman-ev-exit"] },
          contextSourceIds: ["src-havel", "src-solzhenitsyn"],
        },
        {
          kind: "paragraph",
          id: "truman-article-morality-bridge",
          text:
            "Ни один из этих трёх пунктов не требует веры, чтобы согласиться с ним: это просто нравственный счёт, и он сходится у любого зрителя. Но именно он объясняет, почему следующий раздел говорит не о символах, а о подмене: слова, которыми в фильме описана забота, — те же, которыми описывается любовь. Разница не в словаре, а в том, к чему они ведут.",
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
            "Соблазн прочесть «Шоу Трумана» как притчу о Боге-манипуляторе велик, и фильм его услужливо подкармливает: создатель обитает в небе, распоряжается светом, знает о герое всё и любит его по-своему. Но осторожность здесь обязательна: это светская сатира о медиа, а не богословие. Читать её как прямой выпад против Бога — значит проиграть фильму, а не разобрать его.",
        },
        {
          kind: "paragraph",
          id: "truman-article-biblical-2",
          text:
            "Что действительно можно сказать точно — это про подмену. Всеведение создателя звучит как вывернутый псалом, где знание соединено с любовью: «Куда пойду от Духа Твоего?» (Псалом 138:1–12) — там это вопрос существа, которое знают и любят; здесь знание без любви и привязанность собственника. У Бога знание и любовь идут вместе и не поднимают шторм, чтобы удержать человека.",
          support: { evidenceIds: ["truman-ev-trutalk", "truman-ev-storm"] },
          scriptureRefs: ["Псалом 138:1–12"],
        },
        {
          kind: "paragraph",
          id: "truman-article-biblical-sail",
          text:
            "Есть деталь, которую замечают уже не первый год. На парусе «Санта-Марии», когда герой уходит в открытое море, читается номер 139. В синодальной нумерации с этим номером соседствует предыдущий псалом — 138-й, и его девятый и десятый стихи говорят почти буквально то, что происходит на экране (Псалом 138:9–10): «поднимусь ли на крыльях зари, поселюсь ли на краю моря, — и там рука Твоя поведёт меня». Человек уплывает на край моря — и находит там не свободу от взгляда, а сам взгляд. Совпадение это или нет, оно ничего не доказывает и ничего не портит, но последнюю сцену делает точнее.",
          scriptureRefs: ["Псалом 138:9–10"],
        },
        {
          kind: "paragraph",
          id: "truman-article-biblical-3",
          text:
            "Границы Сихейвена похожи на перевёрнутые слова о том, что Бог назначил народам пределы обитания, чтобы они искали Его (Деяния 17:26–27). Создатель строит те же пределы с противоположной целью: чтобы не искал. Один и тот же словарь, противоположная задача — это и есть подмена, а не аллегория.",
          support: { evidenceIds: ["truman-ev-manufactured-limits"] },
          scriptureRefs: ["Деяния 17:26–27"],
        },
        {
          kind: "paragraph",
          id: "truman-article-biblical-4",
          text:
            "И ложь. «Амнезия» отца, обещание друга в управляемом разговоре, альбом, который мать раскрывает на нужной странице, — это не ложь во спасение. Заповедь «не произноси ложного свидетельства» (Исход 20:16) не знает исключения для заботливой лжи. Вся конструкция купола стоит на том, что человеку нельзя доверить его собственную жизнь.",
          support: { evidenceIds: ["truman-ev-album", "truman-ev-reunion-amnesia"] },
          scriptureRefs: ["Исход 20:16"],
        },
        {
          kind: "paragraph",
          id: "truman-article-biblical-voice",
          text:
            "И голос. Создатель разговаривает с героем с неба: слова есть, говорящего не видно. Во Второзаконии народ у горы слышит «голос слов», но образа не видит (Второзаконие 4:12) — там это условие веры, здесь постановочный приём. Совпадает только форма, и большего эта параллель не выдерживает.",
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
            "Финальный ответ героя — не бунт против неба. Это утверждение, что внутри человека есть территория, которую нельзя ни снять, ни продать, ни отнять: камеры в голове у него не было и не будет. С точки зрения христианской антропологии это самая точная формулировка в фильме: человек — образ Божий, а не контент.",
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
              label: "Голос из-за неба объясняет, что создал шоу, дающее надежду миллионам",
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
            "«Шоу Трумана» — редкий случай, когда большая студийная картина ставит вопрос о природе реальности и не снимает его в последней сцене.",
          support: { evidenceIds: ["truman-ev-exit"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-verdict-2",
          text:
            "Фильм сделан с двойной точностью. Как развлечение он безупречен — и именно поэтому его обвинение работает: чтобы рассказать о машине развлечения, он сам должен был стать хорошим развлечением. Он справляется и с тем, и с другим, и в этом смысле его честность оплачена его же качеством.",
        },
        {
          kind: "paragraph",
          id: "truman-article-verdict-craft",
          text:
            "Стоит сказать и то, что теряется в спорах о смысле: картина сделана мастерски. Оператор Питер Бизиу держит в одном фильме два языка — широкоугольный, почти репортажный, для камер шоу, и длиннофокусный, наблюдающий, для камер фильма. В выборке возвращения отца есть объятие у моста наряду с аппаратной, экраном и зрителями; утверждать по ней, что весь эпизод — один неподвижный план, нельзя. Музыка Даллвица и Гласса даёт теме вторую жизнь, а Керри играет человека, который всё время чуть-чуть не в своей роли.",
          support: { evidenceIds: ["truman-ev-reunion"] },
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
            "Двое охранников на посту, смотревших чужую жизнь, спрашивают друг у друга не «как он там» и не «что с ним теперь». Они спрашивают, что ещё идёт, и один уже тянется к пульту. Это и есть последний кадр фильма о зрителе: нас только что попросили посмотреть на себя тем же взглядом, каким мы смотрели на него.",
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
            "Для зрителя, который привык думать, это почти учебник: здесь показано, как работает ложь — не грубая, а объясняющая; как выглядит власть — не злая, а заботливая; и как выглядит выход — не громкий, а молчаливый. Мы начали с того, что измерили фильм. Кончим тем, что он сам предложил измерить нас.",
        },
        {
          kind: "corrections",
          id: "truman-article-corrections",
          caption:
            "Пять утверждений, которые в пересказах звучат увереннее, чем в кадре. Каждое разобрано выше по тексту и каждое меняет смысл, а не только фактуру. Про дождь отдельно: в прошлой редакции мы писали, что эпизода нет вовсе, — это была наша ошибка, и она исправлена здесь.",
          rows: [
            {
              id: "truman-article-correction-rain",
              commonClaim: "Дождь идёт только над Труманом и следует за ним",
              onScreen:
                "Эпизод в фильме есть, но устроен иначе, чем в пересказе: узкая струя падает на сидящего Трумана, он отходит в сторону — струя остаётся на прежнем месте и за ним не идёт, — и только потом дождь расширяется на всю сцену. Механизм («сбой купола») кадры не показывают: это чтение, а не увиденное.",
              evidenceId: "truman-ev-rain",
            },
            {
              id: "truman-article-correction-knife",
              commonClaim: "Труман хватает нож",
              onScreen:
                "Ни ножа, ни блистера в руках: упаковка «Chef's Pal» лежит на столе, Мэрил берёт оттуда кухонные инструменты и держит их перед собой. Рекламная речь в этом эпизоде — про какао, а вопрос, собирается ли она его резать или чистить, задаёт Труман.",
              evidenceId: "truman-ev-knife-tools",
            },
            {
              id: "truman-article-correction-headline",
              commonClaim: "На первой полосе — заголовок «Кто нуждается в Европе?»",
              onScreen:
                "Полоса читается иначе: «CRACKDOWN ON HOMELESS — Enough is Enough!» с фотографией, где уводят отца.",
              evidenceId: "truman-ev-europe",
            },
            {
              id: "truman-article-correction-fingers",
              commonClaim: "Скрещенные пальцы — на свадебной фотографии",
              onScreen:
                "Скрещенные пальцы — на кнопке «HOW'S IT GOING TO END?», которую герой прижимает к груди.",
              evidenceId: "truman-ev-fingers",
            },
            {
              id: "truman-article-correction-tunnel",
              commonClaim: "Труман бежит из города через подкоп",
              onScreen:
                "Исчезновение срежиссировано: камера показывает ту же кровать, под одеялом никого нет, эфир впервые останавливают.",
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
      "Текст опирается на данные о залоченном издании: контрольная сумма и измерения взяты из предоставленного набора, а исходный файл здесь повторно не проверялся. Основа каждой записи показана в реестре. Разбор опубликован 30 октября 2026 года. Подпись редактора дана на делегированных полномочиях — дата согласована заранее, вердикт принадлежит редакции. Числа выводятся из записанного набора, а не набираются руками.",
  },
};
