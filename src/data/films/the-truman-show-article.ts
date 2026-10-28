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
    "Первый разбор «Глубоких вод», построенный не на пересказах, а на измеренном файле: у картины есть контрольная сумма, у каждой опоры — секунда, у каждого числа — воспроизводимый прогон.",
  byline: {
    author: "Редакция «Глубоких вод»",
    editorialRevision: "article-v2",
    draftedAt: "2026-10-28",
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
            "Мы взяли не «фильм вообще», а конкретный носитель: Matroska, 1920×1080, кадровая частота 24000/1001, английская дорожка DTS и встроенные английские субтитры. У файла есть контрольная сумма, у издания — дата замка, у каждой сцены — начало и конец в секундах от нулевого отсчёта. Разбор, который говорит «в сцене на мосту», проверить невозможно. Разбор, который называет секунду, за которую отвечает запись в графе доказательств, — можно.",
        },
        {
          kind: "paragraph",
          id: "truman-article-method-3",
          text:
            "Разница видна сразу. Первое, что мы увидели, измерив: фильм начинается не с героя, а с разговора о герое — и говорит этот разговор изнутри «неба», то есть из декорации, которую герой увидит только в самом конце.",
          support: { evidenceIds: ["truman-ev-interviews"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-method-4",
          text: "Дальше в тексте — опорные точки. Это не эпиграфы: каждая из них каноническая запись, привязанная к проверенной сцене.",
        },
        {
          kind: "timeline",
          id: "truman-article-method-anchors",
          items: [
            {
              id: "truman-article-anchor-interviews",
              timestampSeconds: 19.1,
              label: "Продавец шоу объясняет замысел, стоя на фоне лунной поверхности",
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
              label: "С неба на тротуар падает осветительный прибор с серийной маркировкой",
              evidenceId: "truman-ev-light",
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
            "И тут же — первая поломка. На тротуар падает студийный прибор с трафаретной надписью: не лампа, а единица осветительного оборудования с серийным номером, упавшая с неба. Радио мгновенно находит объяснение: самолёт сбросил детали. Мир не молчит, когда ломается. Он объясняет.",
          support: { evidenceIds: ["truman-ev-light"] },
        },
        {
          kind: "timeline",
          id: "truman-article-machine-anchors",
          items: [
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
      id: "truman-article-props",
      number: 3,
      eyebrow: "03 / Реквизит",
      heading: "Мир как реквизит: три предмета, которые всё объясняют",
      standfirst:
        "Кнопка, тёрка и лестница. Ни один из них не пришёл в кадр как символ: каждый пришёл как товар или как декорация — и уже потом стал доказательством.",
      spoilerLevel: "ENDING",
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
            "В пересказах этот жест часто приписывают свадебному снимку. Свадебных фотографий в фильме достаточно, но скрещенные пальцы — на кнопке самого героя, и он в кадре один. Разница не косметическая: там жена врёт мужу, здесь человек врёт себе, что ещё может не знать ответа.",
        },
        { kind: "subhead", id: "truman-article-props-grater-head", text: "Тёрка" },
        {
          kind: "paragraph",
          id: "truman-article-props-grater",
          text:
            "Сцену срыва обычно описывают так: герой хватает нож и требует ответа. В кадре другое. Он давит вопросами, жена отворачивается к невидимой камере и рекламным голосом расхваливает какао. Когда он не отступает, она поднимает обеими руками кухонную тёрку в блистере — ту самую, которую в начале фильма выдали бесплатно на кассе. Никто не приносил её в дом как оружие. Её принёс рекламный эфир.",
          support: { evidenceIds: ["truman-ev-mococoa", "truman-ev-knife"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-props-grater-2",
          text:
            "И кричит она не мужу. «Сделай же что-нибудь!» — в пустоту, за стену, режиссёру. Женщина, годами игравшая жену, ломается не от разоблачения, а от усталости играть. Если бы в кадре был нож, сцена была бы о насилии героя. В том виде, в каком она снята, она о двух людях, которых использует одна и та же машина.",
          support: { evidenceIds: ["truman-ev-knife-call"] },
        },
        { kind: "subhead", id: "truman-article-props-ladder-head", text: "Лестница" },
        {
          kind: "paragraph",
          id: "truman-article-props-ladder",
          text:
            "В финале лодка бьётся в нарисованный горизонт, и герой идёт вдоль стены. Стена оказывается небом, у которого стоит лестница. Эту сцену полвека читают как «небо оказалось стеной». Верно — и слабее того, что есть в кадре. В кадре не тупик, а декорация со служебным входом: у края мира есть стремянка, потому что кто-то красит небо. Человек упирается не в предел мироздания, а в рабочее место маляра.",
          support: { evidenceIds: ["truman-ev-wall"] },
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
              timestampSeconds: 3250,
              label: "В её руках — кухонная тёрка в блистере, подарок с кассы",
              evidenceId: "truman-ev-knife",
            },
            {
              id: "truman-article-anchor-knife-call",
              timestampSeconds: 3272.199,
              label: "Крик «Сделай же что-нибудь!» уходит не в мужа, а в стену",
              evidenceId: "truman-ev-knife-call",
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
      number: 4,
      eyebrow: "04 / Ремесло",
      heading: "Что показал счёт: фильм, который умеет молчать",
      standfirst:
        "Есть соблазн хвалить эту картину словами: скрытые камеры, виньетки, эффект подглядывания. Всё это верно и всё это говорено. У неё есть более редкое умение, и его можно посчитать: она знает, когда не резать.",
      spoilerLevel: "ENDING",
      blocks: [
        {
          kind: "measurement",
          id: "truman-article-craft-totals",
          measurement: { table: "totals", id: "master" },
          text:
            "Детектор кадровой разницы прогнал весь мастер. Столько переходов он нашёл — и столько реплик лежит во встроенной английской дорожке.",
        },
        {
          kind: "paragraph",
          id: "truman-article-craft-1",
          text:
            "Средняя плотность монтажа выходит совершенно обычной для студийной картины: примерно один переход на несколько секунд экрана. Интересно не среднее. Интересно, где фильм перестаёт резать.",
        },
        {
          kind: "measurement",
          id: "truman-article-craft-hold-father",
          measurement: { table: "hold", id: "hold-01" },
          text:
            "Самый длинный отрезок без единого обнаруженного перехода — возвращение отца. Больше двух минут камера ни разу не переставляется в сцене, где герою возвращают человека, которого он похоронил. Разговор идёт, лица меняются, монтаж не вмешивается.",
          support: { evidenceIds: ["truman-ev-reunion"] },
        },
        {
          kind: "measurement",
          id: "truman-article-craft-hold-library",
          measurement: { table: "hold", id: "hold-02" },
          text:
            "Второй по длине — библиотека: герой пишет, рядом стоит девушка в красном свитере, которая через пару минут скажет ему, что всё вокруг подделка.",
          support: { evidenceIds: ["truman-ev-sylvia"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-craft-2",
          text:
            "Это не «медленные сцены». Это единственные места, где никто не монтирует героя: одна камера, один план, никакого решения, принятого за него. И оба раза это сцена, в которой шоу теряет власть — потому что там говорят о настоящем.",
        },
        {
          kind: "measurement",
          id: "truman-article-craft-silence",
          measurement: { table: "silence", id: "silence-01" },
          text:
            "А теперь переворот того же приёма. Самый длинный отрезок без реплик приходится на финал: у края нарисованного неба фильм говорит только монтажом — и говорит часто.",
          support: { evidenceIds: ["truman-ev-wall"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-craft-3",
          text:
            "Обычно тишина в кино означает покой, а монтаж — движение. Здесь наоборот. Когда герой остаётся один, эфир перестаёт быть заполненным, и в этой пустоте нет ничего, что можно продать. Свобода в фильме выглядит как рекламная пауза, из которой убрали рекламу.",
        },
        {
          kind: "measurement-table",
          id: "truman-article-craft-windows",
          caption: "Четыре окна, в которых видно, как фильм дышит.",
          columns: ["Момент", "Переходы", "Реплики"],
          rows: [
            {
              id: "truman-article-window-library",
              label: "Библиотека: герой пишет, рядом девушка в красном",
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
              label: "Город в переполохе: «он идёт!»",
              measurement: { table: "window", id: "panic" },
            },
          ],
        },
        {
          kind: "paragraph",
          id: "truman-article-craft-4",
          text:
            "Оговорка, без которой эти числа были бы ложью: детектор ловит скачки кадровой разницы, а длинный наплыв может пройти ниже порога и прочитаться как один непрерывный кусок. Поэтому мы пишем «обнаруженный переход», а не «склейка» в смысле окончательного монтажного листа. Все числа выше сняты с полного разрешения; ранний прогон по уменьшенной копии дал немного больше переходов — и это цена разрешения, а не изменчивость фильма.",
        },
        {
          kind: "paragraph",
          id: "truman-article-craft-5",
          text:
            "Фильм про слежку устроен как слежка и выдаёт себя ритмом: в переполохе камеры мечутся, в тишине — стоят. Смотреть его внимательно значит ловить не сюжет, а темп, которым шоу пытается удержать своего героя в кадре.",
          support: { evidenceIds: ["truman-ev-wall"] },
        },
      ],
    },
    {
      id: "truman-article-morality",
      number: 5,
      eyebrow: "05 / Нравственный счёт",
      heading: "Кто виноват и в чём",
      spoilerLevel: "ENDING",
      blocks: [
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
            "Кристоф не садист. Он искренне считает, что подарил человеку рай, и говорит это в эфире: мир, в котором вы живёте, — больной, а Сихейвен — то, каким мир должен быть. Когда героя уносит штормом, Кристоф держит волну собственными руками и сдаётся только у края гибели.",
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
      number: 6,
      eyebrow: "06 / Библейская оптика",
      heading: "Подмена, а не аллегория",
      spoilerLevel: "ENDING",
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
            "Что действительно можно сказать точно — это про подмену. Всеведение создателя вывернуто из того места, где знание соединено с любовью: он знает о герое всё и не любит его, а владеет им. У Бога знание и любовь идут вместе и не поднимают шторм, чтобы удержать человека; здесь есть знание без любви и привязанность собственника.",
          support: { evidenceIds: ["truman-ev-trutalk", "truman-ev-storm"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-biblical-3",
          text:
            "Границы Сихейвена — вывернутые слова о том, что Бог назначил народам пределы обитания, чтобы они искали Его. Создатель строит те же пределы с противоположной целью: чтобы не искал. Один и тот же словарь, противоположная задача — это и есть подмена, а не аллегория.",
          support: { evidenceIds: ["truman-ev-manufactured-limits"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-biblical-4",
          text:
            "И ложь. «Амнезия» отца, обещание друга, отрепетированное до нужной интонации, альбом, который мать раскрывает на нужной странице, — это не ложь во спасение. Заповедь о ложном свидетельстве не знает исключения для заботливой лжи. Вся конструкция купола стоит на том, что человеку нельзя доверить его собственную жизнь.",
          support: { evidenceIds: ["truman-ev-album", "truman-ev-reunion-amnesia"] },
        },
        {
          kind: "paragraph",
          id: "truman-article-biblical-5",
          text:
            "Финальный ответ героя — не бунт против неба. Это утверждение, что внутри человека есть территория, которую нельзя ни снять, ни продать, ни отнять: камеры в голове у него не было и не будет. С точки зрения христианской антропологии это самая точная формулировка в фильме: человек — образ Божий, а не контент.",
          support: { evidenceIds: ["truman-ev-nocamera"] },
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
      number: 7,
      eyebrow: "07 / Вердикт",
      heading: "Дверь закрывается, вопрос остаётся",
      spoilerLevel: "FULL",
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
            "Пять утверждений, которые не выдержали проверки по мастеру. Каждое исправлено выше по тексту и каждое меняет смысл, а не только фактуру.",
          rows: [
            {
              id: "truman-article-correction-rain",
              commonClaim: "Дождь идёт только над Труманом",
              onScreen:
                "Такого эпизода в фильме нет: ни в субтитрах, ни в кадрах соответствующей главы дождя над героем не обнаружено.",
              absentFromMaster: true,
            },
            {
              id: "truman-article-correction-knife",
              commonClaim: "Труман хватает нож",
              onScreen: "В кадре — кухонная тёрка «Chef's Pal» в блистере, поднятая женой, а не героем.",
              evidenceId: "truman-ev-knife",
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
      "Текст опирается на залоченное издание и проверен по кадрам и по встроенной дорожке субтитров. Он остаётся редакционным черновиком: человеческая подпись редактора не поставлена, поэтому страница не индексируется и не считается публикацией. Числа в тексте печатаются из измеренного набора, а не набираются руками, — чтобы следующая правка не могла разойтись с мастером.",
  },
};
