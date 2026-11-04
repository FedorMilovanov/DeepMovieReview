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
    "Первый разбор «Глубоких вод» опирается на предоставленные измерения, отдельные кадры и субтитры. В реестре указан материал проверки или отмечено, что он не записан.",
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
            "В этом разборе мы сначала фиксируем доступные наблюдения и измерения, а затем предлагаем их интерпретацию. Ссылки на опоры позволяют проверить, из чего вырос вывод и где материал оставляет вопрос открытым.",
        },
        {
          kind: "paragraph",
          id: "truman-article-method-2",
          text:
            "Основа разбора — измерения и записи, привязанные к конкретному носителю: в манифесте указаны Matroska, 1920×1080, частота 24000/1001, английская дорожка DTS, субтитры и контрольная сумма. В независимой проверке 4 ноября 2026 года заново вычислены размер и SHA-256 всего исходного файла: они совпали с реестром. По этому же файлу выборочно сверены кадры и несколько фрагментов оригинального английского звука с субтитрами. Это не непрерывный просмотр всей картины со звуком; временные отметки старых отдельных клипов и контактных сеток по-прежнему приблизительны.",
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
            "Часть пересказов расходится с доступными кадрами и субтитрами; другие выборка не подтверждает. Она не доказывает отсутствия детали во всём фильме. Оговорки собраны в таблице.",
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
            "Событие. На доступном отдельном кадре Труман наклонился под узкой струёй дождя. Сам кадр не показывает, куда струя движется дальше и расширяется ли дождь.",
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
            },
            {
              id: "truman-article-anchor-radio",
              timestampSeconds: 1798.265,
              label: "В субтитрах записан маршрут и команда статистам; отдельно показан кадр Трумана в машине",
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
            "Выборочный кадр показывает газету с заголовком о борьбе с бездомностью и фотографией полицейского с человеком. Это можно прочитать как предложение удобного объяснения произошедшего. Но по отдельным кадрам мы не установили ни точную последовательность, ни то, что на фотографии изображён тот же человек, которого видел Труман.",
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
        "Вместо поиска одного злодея рассмотрим ответственность людей вокруг Трумана: какие решения они принимают, что знают и какую цену платят за свои роли.",
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
            "Мэрил — неудобный персонаж фильма: она играет жену в устроенном для Трумана мире. В субтитрах кухонного эпизода есть текст о какао и просьба о помощи; по доступным материалам мы не устанавливаем автора и адресата этих реплик. Её участие в обмане можно объяснять рабочей ролью, но по отдельным кадрам нельзя достоверно восстановить её мысли.",
          support: { evidenceIds: ["truman-ev-cocoa-subtitles", "truman-ev-knife-call"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-cast-marlon",
          text:
            "Дружба Марлона устроена неоднозначно. В английских субтитрах обещание не лгать записано дважды почти теми же словами. Кто и зачем повторяет фразу, по тексту не установить; звук и непрерывный монтаж мы не проверяли. Отдельные изображения аппаратной и разговор в мире шоу позволяют поставить вопрос о доверии, но не доказывают подсказку или чувства друга.",
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
            "Герои занимают в шоу разные позиции: одни знают о представлении, Труман — нет. Это не позволяет автоматически измерить искренность Кристофа, Мэрил или Марлона. Можно сочувствовать тому, чьи отношения поставлены в условия обмана, не объявляя чувства других поддельными.",
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
            "Кухонный эпизод ставит брак под давление. В субтитрах появляется рекламный текст о какао; на отдельных кадрах Мэрил держит кухонные инструменты и Труман её удерживает. Эти основания нельзя склеить в непрерывный монтаж: автор реплик, адрес рекламного обращения и намерение жеста по ним не установлены.",
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
            "В субтитрах есть просьба «Сделай же что-нибудь!». Её можно читать как обращение к создателям, но текст и кадры не устанавливают говорящего, адресата или мотивы. На другом кадре Труман удерживает Мэрил.",
          support: { evidenceIds: ["truman-ev-knife-tools", "truman-ev-knife-call", "truman-ev-meryl-held"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-bonds-marriage-3",
          text:
            "Рекламный текст в субтитрах можно прочитать как обращение к невидимой аудитории посреди личного конфликта, но автора и адресата нужно проверять отдельно. Выборочные кадры показывают и кухонные предметы, и изображение участников на мониторе, но не восстанавливают непрерывный переход или точный адрес каждой реплики.",
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
            "Сцену срыва часто пересказывают так: Труман хватает нож. В проверенных отдельных кадрах видна другая деталь: на столе лежит упаковка «Chef's Pal», а позднее Мэрил держит кухонные инструменты перед собой. В субтитрах рядом с эпизодом есть рекламный текст о какао Mococoa — напитке, а не инструменте. Эти выборочные кадры не доказывают, что во всей сцене нет ножа, и сами по себе не устанавливают, кто произносит ту или иную реплику.",
          support: { evidenceIds: ["truman-ev-cocoa-subtitles", "truman-ev-knife", "truman-ev-knife-tools"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-props-grater-2",
          text:
            "В субтитрах есть просьба «Сделай же что-нибудь!»; автор и адресат не установлены. Кадры фиксируют инструменты в руках Мэрил и удержание Труманом, но не доказывают намерений.",
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
            "По ранее полученному отчёту детектор кадровой разницы обработал весь исходный файл; сам файл здесь повторно не проверялся. Рядом — число найденных переходов и записей в английских субтитрах; одна запись не обязательно равна одной реплике.",
        },
        {
          kind: "paragraph",
          id: "truman-article-craft-1",
          text:
            "Отношение длительности файла к числу обнаружений включает начало до первого и хвост после последнего. Средний промежуток между соседними обнаружениями считается отдельно и не включает эти края. Ни одно из чисел не заменяет полный монтажный лист.",
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
            "В этих окнах детектор не отметил переходов выше порога. Это не доказательство непрерывного плана: в кадрах с Марлоном видны пропущенные смены планов, а в библиотеке меняются ракурс и участники. Выборка отдельных кадров не заменяет непрерывный просмотр или полный монтажный лист.",
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
            "Звук этого окна мы не проверяли. Как интерпретация, одиночество героя можно противопоставить частым сменам изображения: свобода здесь напоминает рекламную паузу, из которой убрали рекламу. Это чтение сцены, а не вывод о тишине из отсутствия субтитров.",
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
            "Оговорка: детектор ловит скачки кадровой разницы и может пропустить смену плана или длинный наплыв. Это обнаруженные переходы, не окончательный монтажный лист. В окнах посчитаны только начала записей субтитров: запись, начавшаяся до окна, не входит в число, даже если она ещё показывалась. По предоставленному отчёту подсчёт делался на полном разрешении; повторно сам мастер мы не проверяли.",
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
            "На кадрах оригинального фильма около 4980–4982 с читается название «SANTA MARIA» на корме лодки. Оно позволяет провести ассоциацию с одноимённым кораблём Колумба, но не устанавливает, что создатели фильма намеренно заложили эту параллель.",
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
            "Уход оправдан не обещанием счастья снаружи — выборочные кадры этого не устанавливают, — а правом человека самому решать. Слова о предпочтении клетки и финальный шаг можно читать как спор о свободе.",
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
            "Создатель обитает в небе и распоряжается устройством шоу — эти образы допускают богословское сопоставление. Но фильм не трактат о Боге, а мотивы Кристофа остаются предметом чтения, не установленным фактом.",
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
            "Lozier Institute сопоставляет название лодки «Санта-Мария» и номер 139 на парусе со словами Писания (Псалом 138:9–10). В самом фильме независимо подтверждены две надписи: «SANTA MARIA» на корме около 4981 с и «139» на парусе около 5235 с. Обе надписи видимы, но авторский замысел и намеренная библейская отсылка не установлены.",
          support: { evidenceIds: ["truman-ev-setting-sail", "truman-ev-sail-139"] },
          contextSourceIds: ["src-lozier"],
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
            "Фильм предлагает сопоставить объясняющую ложь, власть, называющую себя заботой, и решение выйти из устроенного мира. Это редакционное прочтение, а не вывод из одной метрики: отсутствие записей субтитров не доказывает тишину, звук мы не проверяли.",
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
                "Эпизод есть: на доступном отдельном кадре Труман под узкой струёй. Прежнее отрицание самого эпизода было ошибкой. Следует ли струя за ним, расширяется ли дождь и как это устроено, по одному изображению не установить.",
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
      "Текст опирается на данные о залоченном издании: 4 ноября 2026 года исходный MKV независимо пересчитан по SHA-256 и размеру — результат совпал с реестром. Несколько кадров и фрагментов оригинальной звуковой дорожки проверены выборочно; полного непрерывного просмотра со звуком это не заменяет. Основа каждой записи показана в реестре. Разбор опубликован 30 октября 2026 года. Подпись редактора дана на делегированных полномочиях — дата согласована заранее, вердикт принадлежит редакции. Числа выводятся из записанного набора, а не набираются руками.",
  },
};
