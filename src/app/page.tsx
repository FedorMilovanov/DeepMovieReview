import Link from "next/link";
import { AnalysisWorkbench } from "@/components/analysis-workbench";
import type { NarrativePermissionState } from "@/lib/content";
import { requireFilmPackageBySlug } from "@/data/film-registry";
import { homepageFeaturedFilmSlug, isPreviewContentEnabled } from "@/data/site-config";
import { projectHomepage, type HomepageViewModel } from "@/lib/homepage-projection";
import type { Confidence } from "@/lib/film-package";

const featuredFilmPackage = requireFilmPackageBySlug(homepageFeaturedFilmSlug);

const permissionStateLabels: Record<NarrativePermissionState, string> = {
  CONDEMNED: "Осуждается",
  COSTLY: "Достаётся ценой",
  QUESTIONED: "Под вопросом",
  UNCHALLENGED: "Без осмысления",
  NORMALIZED: "Нормализуется",
  REWARDED: "Вознаграждается",
  CELEBRATED: "Прославляется",
  AMBIGUOUS: "Неоднозначно",
};

const confidenceLabels: Record<Confidence, string> = {
  HIGH: "Высокая",
  MEDIUM: "Средняя",
  LOW: "Низкая",
};

type LensMark = { label: string; x: string; y: string };

type LensStageLens = {
  key: string;
  label: string;
  prompt: string;
  reading: string;
  marks: LensMark[];
};

const lensStageLenses: LensStageLens[] = [
  {
    key: "story",
    label: "История",
    prompt: "Что происходит — и почему каждая развилка важна?",
    reading:
      "Сюжет, причинность и поворотные точки разбираются отдельно от моральной оценки. Сначала — как устроена история.",
    marks: [
      { label: "Завязка", x: "14%", y: "62%" },
      { label: "Конфликт · желание против долга", x: "44%", y: "34%" },
      { label: "Перелом · цена выбора", x: "72%", y: "58%" },
    ],
  },
  {
    key: "people",
    label: "Люди",
    prompt: "Чего герои хотят, чего боятся и во что верят?",
    reading:
      "Персонаж — не ячейка морального счётчика, а человек с желаниями, страхами и противоречиями. Психология — часть аргумента фильма.",
    marks: [
      { label: "Хочет: контроль", x: "13%", y: "30%" },
      { label: "Боится: потери", x: "20%", y: "70%" },
      { label: "Хочет: правду", x: "68%", y: "28%" },
      { label: "Противоречие · защищает, не доверяя", x: "56%", y: "66%" },
    ],
  },
  {
    key: "relationships",
    label: "Отношения",
    prompt: "Как меняются доверие, власть и верность?",
    reading:
      "Отношения прослеживаются как динамика: события меняют доверие, правдивость и распределение власти — от сцены к сцене.",
    marks: [
      { label: "Доверие", x: "12%", y: "34%" },
      { label: "Разлом", x: "44%", y: "22%" },
      { label: "Восстановление?", x: "70%", y: "34%" },
    ],
  },
  {
    key: "ideas",
    label: "Идеи",
    prompt: "На какой вопрос о жизни фильм предлагает ответ?",
    reading:
      "Тема, явный тезис и мировоззренческие допущения фиксируются вместе с контрдоказательствами и уровнем уверенности.",
    marks: [
      { label: "Вопрос фильма", x: "20%", y: "26%" },
      { label: "Явная теза", x: "38%", y: "56%" },
      { label: "Контрдоказательство", x: "66%", y: "70%" },
    ],
  },
  {
    key: "moral-world",
    label: "Моральный мир",
    prompt: "Что фильм осуждает, нормализует или вознаграждает?",
    reading:
      "Мы читаем не только диалоги: что наказывается, что остаётся без последствий и что украшено — это и есть моральная речь кино.",
    marks: [
      { label: "Последствие", x: "16%", y: "32%" },
      { label: "Без осмысления", x: "46%", y: "62%" },
      { label: "Вознаграждение", x: "72%", y: "30%" },
    ],
  },
  {
    key: "craft",
    label: "Мастерство",
    prompt: "Как камера, монтаж и музыка формируют симпатию?",
    reading:
      "Форма — часть аргумента. Ракурс, ритм, музыка и харизма создают симпатию раньше нашего согласия — и мы это учитываем.",
    marks: [
      { label: "Камера · близко", x: "14%", y: "30%" },
      { label: "Музыка · тишина", x: "44%", y: "20%" },
      { label: "Монтаж · замедление", x: "70%", y: "58%" },
    ],
  },
];

const pipelineSteps = [
  { label: "Фильм", note: "что мы видим и слышим" },
  { label: "История", note: "структура, причинность, повороты" },
  { label: "Люди", note: "желания, страхи, противоречия" },
  { label: "Отношения", note: "доверие, власть, верность, восстановление" },
  { label: "Идеи", note: "темы и явные тезисы о жизни" },
  { label: "Обучение", note: "что наказывается и вознаграждается" },
  { label: "Форма", note: "как мастерство формирует симпатию" },
  { label: "Моральная форенсика", note: "мотив, знание, давление, последствия" },
  { label: "Библейский взгляд", note: "принцип, применение, оговорки" },
  { label: "Синтез", note: "прозаический вывод без одной цифры" },
] as const;

const permissionStops = [
  { state: "CONDEMNED", label: "Осуждается" },
  { state: "COSTLY", label: "Ценой" },
  { state: "QUESTIONED", label: "Под вопросом" },
  { state: "UNCHALLENGED", label: "Без осмысления" },
  { state: "NORMALIZED", label: "Нормализуется" },
  { state: "REWARDED", label: "Вознаграждается" },
  { state: "CELEBRATED", label: "Прославляется" },
] as const satisfies ReadonlyArray<{ state: NarrativePermissionState; label: string }>;

const permissionExamples = [
  { subject: "Ложь во спасение", state: "COSTLY" },
  { subject: "Верность другу", state: "REWARDED" },
  { subject: "Месть", state: "AMBIGUOUS" },
  { subject: "Жертвенность", state: "CELEBRATED" },
  { subject: "Власть без ответа", state: "UNCHALLENGED" },
] as const;

const evidenceChain = [
  { label: "Наблюдение", copy: "Что фактически происходит на экране?" },
  { label: "Тезис", copy: "Какую интерпретацию мы предлагаем?" },
  { label: "Доказательства", copy: "Какие сцены, выборы и формальные приёмы её поддерживают?" },
  { label: "Контрдоказательства", copy: "Что в фильме ей противоречит?" },
  { label: "Уверенность", copy: "Насколько сильно это можно утверждать?" },
  { label: "Норма", copy: "Какой библейский принцип релевантен — и с какой уверенностью?" },
  { label: "Синтез", copy: "Итог — прозой, без сведения фильма к одной цифре." },
] as const;

const autopsyDemo = [
  { term: "Действие", value: "Персонаж скрывает информацию, которая меняет выбор другого." },
  { term: "Мотив", value: "Защита близкого — и удержание контроля." },
  { term: "Знание", value: "Ему известно то, чего второй участник не знает." },
  { term: "Давление", value: "Внешняя угроза сжимает время решения." },
  { term: "Последствие", value: "Доверие повреждено; настоящая цена вскроется позже." },
] as const;

const craftPressures = [
  {
    label: "Давление эмпатии",
    copy: "Насколько сильно форма приглашает понять и почувствовать героя изнутри — камерой, ритмом, тишиной.",
  },
  {
    label: "Давление подражания",
    copy: "Насколько сильно форма делает героя, его стиль и его выбор желанными и привлекательными.",
  },
] as const;

const spoilerLevels = [
  { level: "Без спойлеров", note: "только завязка и метод" },
  { level: "Минимальные", note: "структура без финала" },
  { level: "Серьёзные", note: "повороты и развязки" },
  { level: "Финал", note: "развязка и её цена" },
  { level: "Полный разбор", note: "вся глубина анализа" },
] as const;

const biblicalSteps = [
  { label: "Наблюдение", copy: "Что история действительно показывает — без спешки с оценкой." },
  { label: "Принцип", copy: "Какой библейский принцип релевантен: прямое повеление, широкий принцип или суждение мудрости." },
  { label: "Применение", copy: "Что это значит для фильма и зрителя — без натяжек." },
  { label: "Оговорка", copy: "Где интерпретация или применение остаётся спорным — честно и явно." },
] as const;

function FrameScene({ figures = false }: { figures?: boolean }) {
  return (
    <div className="frameScene" aria-hidden="true">
      <div className="sceneSky" />
      <div className="sceneCloudsA" />
      <div className="sceneCloudsB" />
      <div className="sceneOrb" />
      <div className="sceneHaze" />
      <div className="sceneHorizon" />
      <div className="sceneGround" />
      {figures ? (
        <>
          <div className="sceneFigure sceneFigureA" />
          <div className="sceneFigure sceneFigureB" />
        </>
      ) : null}
      <div className="sceneGrain" />
      <div className="sceneVignette" />
    </div>
  );
}

function HeroStatusStrip({ preview }: { preview: boolean }) {
  return (
    <div className="heroStatusStrip sectionShell" role="list" aria-label="Статус платформы">
      <div role="listitem">
        <span className="heroStatusIndex">{preview ? "FILM 001" : "КОРПУС"}</span>
        <strong>{preview ? "«Шоу Трумана» · 1998" : "Материалы готовятся"}</strong>
        <span>{preview ? "исследовательский черновик собран, кадровая сверка впереди" : "незавершённые разборы остаются в редакции"}</span>
      </div>
      <div role="listitem">
        <span className="heroStatusIndex">МЕТОД</span>
        <strong>Доказательства → сцены → таймкоды</strong>
        <span>публикуемый тезис должен быть воспроизводимо привязан к кадру</span>
      </div>
      <div role="listitem">
        <span className="heroStatusIndex">СТАТУС</span>
        <strong>Предзапуск</strong>
        <span>публикация — после независимой проверки</span>
      </div>
    </div>
  );
}

function LensStage() {
  return (
    <section id="lenses" className="sectionShell sectionRule lensStageSection" aria-labelledby="lenses-title">
      <div className="sectionIndex">03 / Шесть линз</div>
      <h2 id="lenses-title">Один фильм. Шесть прочтений.</h2>
      <p className="sectionIntro">
        Мораль — не первый вопрос. Первый вопрос: что это за история и кто эти люди. Выберите линзу — кадр ответит.
      </p>
      <div className="lensStage">
        <div className="lensStageGrid">
          <div className="lensFrameWrap">
            <div className="livingFrame lensFrame">
              <div className="frameMeta">
                <span>Кадр · 0002</span>
                <span>2.39:1</span>
              </div>
              <FrameScene figures />
              {lensStageLenses.map((lens) => (
                <div className="lensMarkGroup" data-lens={lens.key} key={lens.key}>
                  {lens.marks.map((mark) => (
                    <span className="lensMark" style={{ left: mark.x, top: mark.y }} key={mark.label}>
                      {mark.label}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <p className="lensFrameNote">Демонстрация инструмента: разметка живёт в кадре, а не в тексте эссе.</p>
          </div>
          <div className="lensPanel">
            <fieldset className="lensSelector">
              <legend className="lensSelectorLegend">Линза</legend>
              {lensStageLenses.map((lens, index) => (
                <label className="lensTab" htmlFor={`lens-radio-${lens.key}`} key={lens.key}>
                  <input
                    className="lensRadio"
                    defaultChecked={index === 0}
                    id={`lens-radio-${lens.key}`}
                    name="homepage-lens"
                    type="radio"
                    value={lens.key}
                  />
                  <span className="lensTabLabel">
                    <span className="lensTabIndex" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    {lens.label}
                  </span>
                </label>
              ))}
            </fieldset>
            <div className="lensReadings" aria-live="polite">
              {lensStageLenses.map((lens) => (
                <div className="lensReading" data-lens={lens.key} key={lens.key}>
                  <h3>{lens.label}</h3>
                  <p className="lensReadingPrompt">{lens.prompt}</p>
                  <p>{lens.reading}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlatformLanding({ preview }: { preview: boolean }) {
  return (
    <>
      <section className="heroSection sectionShell" aria-labelledby="hero-title">
        <div className="eyebrow">Исследование кино через библейскую картину мира · {preview ? "структурный просмотр" : "предзапуск"}</div>
        <div className="heroGrid">
          <div className="heroCopy">
            <p className="kicker">Сначала фильм. Доказательства — потом вердикт.</p>
            <h1 id="hero-title">Фильм — больше, чем происходящее на экране.</h1>
            <p className="lede">
              Кино показывает, чем восхищаться, чего бояться, что прощать и во что верить. «Глубокие воды» разбирают
              фильм как историю о людях — сюжет, характеры, отношения, идеи, форма — и лишь затем аргументируют
              моральный и библейский вывод.
            </p>
            <div className="heroActions">
              <Link className="buttonPrimary" href="/methodology">Читать методологию</Link>
              <Link className="buttonGhost" href="#lenses">Шесть линз</Link>
            </div>
            {preview ? (
              <p className="heroPreviewNote">
                Режим предпросмотра: ниже главной — <Link href="#structural-stand">структурный стенд</Link> с тестовыми
                данными платформы.
              </p>
            ) : null}
          </div>
          <div className="livingFrame" aria-label="Живой кадр «Глубокие воды»">
            <div className="frameMeta">
              <span>Кадр · 0001</span>
              <span>2.39:1</span>
            </div>
            <FrameScene />
            <div className="frameCaption">
              <strong>Доказательства раньше вердикта</strong>
              <span>Публичная страница показывает метод. Незавершённые разборы остаются в редакции.</span>
            </div>
          </div>
        </div>
        <div className="heroScrollCue" aria-hidden="true">
          <span className="heroScrollLine" />
          Прокрутите
        </div>
      </section>

      <HeroStatusStrip preview={preview} />

      <section className="sectionShell sectionRule missionSection" aria-labelledby="mission-title">
        <div className="missionGrid">
          <div>
            <div className="sectionIndex">01 / Метод</div>
            <h2 id="mission-title">Понять историю — прежде чем судить её.</h2>
            <p className="sectionIntro">
              Мы не начинаем с оценки. Сначала разбирается сам фильм: какая история рассказана, кто эти люди, как
              устроены их отношения, что фильм утверждает о жизни — и какими средствами он вовлекает нас на свою
              сторону.
            </p>
            <p className="missionAffirm">
              Сначала — фильм как фильм. Потом — аргументированный вывод.
            </p>
          </div>
          <ul className="missionDenyList" aria-label="Чем этот сайт не является">
            <li>Не счётчик грехов</li>
            <li>Не родительский чек-лист «16+»</li>
            <li>Не «христианская» обёртка обычного рейтинга</li>
            <li>Не один «моральный балл» на фильм</li>
          </ul>
        </div>
      </section>

      <section className="sectionShell sectionRule" aria-labelledby="pipeline-title">
        <div className="sectionIndex">02 / Маршрут анализа</div>
        <h2 id="pipeline-title">Десять слоёв от экрана до вывода.</h2>
        <p className="sectionIntro">
          Каждый слой — отдельные структурированные данные, а не абзацы одного эссе. Так вывод можно проверить —
          и оспорить по-честному.
        </p>
        <ol className="pipelineTrack" aria-label="Маршрут анализа">
          {pipelineSteps.map((step, index) => (
            <li className="pipelineStep" key={step.label}>
              <span className="pipelineStepIndex" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <strong>{step.label}</strong>
              <span className="pipelineStepNote">{step.note}</span>
            </li>
          ))}
        </ol>
      </section>

      <LensStage />

      <AnalysisWorkbench />

      <section className="sectionShell sectionRule" aria-labelledby="permission-title">
        <div className="sectionIndex">05 / Нарративное разрешение</div>
        <h2 id="permission-title">Что фильм делает нормальным?</h2>
        <p className="sectionIntro">
          Кино учит не только словами. Оно наказывает, вознаграждает, украшает и оставляет без последствий. Мы читаем
          эти сигналы как отдельный слой анализа — от осуждения до прославления.
        </p>
        <div className="permissionAxis" role="list" aria-label="Шкала нарративного разрешения">
          {permissionStops.map((stop) => (
            <span className="permissionAxisStop" role="listitem" key={stop.state}>{stop.label}</span>
          ))}
        </div>
        <ul className="permissionExamples" aria-label="Примеры состояний (демонстрация)">
          {permissionExamples.map((example) => (
            <li className="permissionExample" key={example.subject}>
              <span>{example.subject}</span>
              <strong>{permissionStateLabels[example.state]}</strong>
            </li>
          ))}
        </ul>
        <p className="permissionDemoNote">Демонстрация шкалы — не вердикты по конкретным фильмам.</p>
        <ul className="permissionRules" aria-label="Правила чтения сигналов">
          <li>Не осуждено ≠ одобрено</li>
          <li>Частота ≠ нормализация</li>
          <li>Красота кадра ≠ оправдание поступка</li>
        </ul>
      </section>

      <section className="sectionShell sectionRule splitSection evidenceSection" aria-labelledby="evidence-title">
        <div className="evidenceIntro">
          <div className="sectionIndex">06 / Доказательства</div>
          <h2 id="evidence-title">Тезисы привязаны к сценам.</h2>
          <p className="sectionIntro">
            Каждое интерпретационное утверждение имеет опору: каноническая сцена, таймкод, характер действия. Спорное
            место фиксируется как контрдоказательство, а не замалчивается.
          </p>
        </div>
        <div className="evidenceBody">
          <div className="autopsyFrame" aria-label="Демонстрация вскрытия сцены">
            <span className="autopsyFrameTag">Сцена 014 · Акт II</span>
            <span className="autopsyFrameTc">TC 00:47:12</span>
            <FrameScene figures />
            <div className="autopsyCrosshair" aria-hidden="true" />
          </div>
          <dl className="autopsyGrid">
            {autopsyDemo.map((item) => (
              <div key={item.term}>
                <dt>{item.term}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
          <p className="autopsyDemoNote">Абстрактный пример инструмента — не фрагмент реального разбора.</p>
        </div>
        <ol className="evidenceChain" aria-label="Цепочка доказательств">
          {evidenceChain.map((step, index) => (
            <li key={step.label}>
              <span className="evidenceChainIndex" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{step.label}</strong>
                <p>{step.copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="sectionShell sectionRule" aria-labelledby="craft-title">
        <div className="sectionIndex">07 / Форма</div>
        <h2 id="craft-title">Что фильм заставляет почувствовать, прежде чем попросить подумать?</h2>
        <p className="sectionIntro">
          Ракурс, монтаж, музыка, свет и харизма формируют симпатию до нашего согласия. Поэтому форма — не
          «технический раздел», а часть аргумента. Мы разделяем два разных давления:
        </p>
        <div className="craftPressureGrid">
          {craftPressures.map((pressure) => (
            <article className="craftPressureCard" key={pressure.label}>
              <span className="microLabel">{pressure.label}</span>
              <p>{pressure.copy}</p>
            </article>
          ))}
        </div>
        <p className="craftNote">Сочувствие ≠ одобрение: эмпатия к персонажу — ещё не согласие с его выбором.</p>
      </section>

      <section className="sectionShell sectionRule" aria-labelledby="spoilers-title">
        <div className="sectionIndex">08 / Спойлеры</div>
        <h2 id="spoilers-title">Спойлер — это уровень данных, а не размытие текста.</h2>
        <p className="sectionIntro">
          Глубина раскрытия управляется структурно: защищённый контент не попадает на страницу, пока вы сами его не
          откроете. Ссылка на скрытый уровень не вскроет его случайно, а вывод не опирается на то, что вам пока
          скрыто.
        </p>
        <ol className="spoilerLadder" aria-label="Уровни раскрытия спойлеров">
          {spoilerLevels.map((level, index) => (
            <li className="spoilerStep" key={level.level} style={{ "--step": index } as React.CSSProperties}>
              <strong>{level.level}</strong>
              <span>{level.note}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="sectionShell sectionRule biblicalSection" aria-labelledby="biblical-title">
        <div className="sectionIndex">09 / Библейский взгляд</div>
        <h2 id="biblical-title">Норма — после тщательного описания.</h2>
        <p className="sectionIntro">
          Когда фильм понят, мы переходим от наблюдения к норме — спокойно и аргументированно. Мы различаем прямое
          повеление, широкий библейский принцип, суждение мудрости, спорное применение и благоразумие — и не выдаём
          одно за другое.
        </p>
        <ol className="synthesisSteps">
          {biblicalSteps.map((step) => (
            <li key={step.label}>
              <span>{step.label}</span>
              <p>{step.copy}</p>
            </li>
          ))}
        </ol>
        <p className="biblicalClosing">
          Итог — прозой: ремесло, глубина истории, моральная позиция, искупительное движение. Без единого
          «христианского балла».
        </p>
      </section>

      <section className="sectionShell sectionRule discoverySection" aria-labelledby="discovery-title">
        <div>
          <div className="sectionIndex">10 / Статус</div>
          <h2 id="discovery-title">Библиотека строится.</h2>
          <p className="sectionIntro">
            Мы не показываем счётчики, которых нет. Каждая публикация проходит полный цикл: канонические сцены,
            таблица доказательств, независимая проверка синтеза.
          </p>
        </div>
        <div className="discoveryPanel">
          {preview ? (
            <>
              <article className="discoveryCard">
                <span className="microLabel">FILM 001 · исследовательский черновик</span>
                <strong>«Шоу Трумана» · 1998</strong>
                <p>
                  Целевое издание выбрано, но точный просмотренный мастер ещё не заблокирован. По вторичным источникам
                  собраны пятнадцать черновых сцен и тридцать восемь исследовательских опор. До публикации каждая сцена,
                  таймкод и опора должны быть заново воспроизведены по точному мастеру.
                </p>
              </article>
              <article className="discoveryCard">
                <span className="microLabel">FILM 002 · исследовательский черновик</span>
                <strong>«Форсаж» · 2001</strong>
                <p>
                  Предварительные гипотезы собраны по вторичным источникам: четырнадцать черновых сцен и тридцать две
                  исследовательские опоры. Это не канонический разбор; кадровая сверка с точным мастером ещё впереди.
                </p>
              </article>
            </>
          ) : (
            <article className="discoveryCard">
              <span className="microLabel">Публичный корпус · предзапуск</span>
              <strong>Первый проверенный разбор готовится.</strong>
              <p>Незавершённые фильмы, рабочие гипотезы и вторичные исследовательские записи не выходят на публичную поверхность до блокировки мастера и независимой проверки.</p>
            </article>
          )}
          <div className="discoveryLinks">
            <Link href="/methodology">Читать методологию</Link>
            <Link href="/films">Посмотреть фильмы</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function FilmHero({ data }: { data: HomepageViewModel }) {
  const { featuredFilm } = data;
  return (
    <section className="heroSection sectionShell" aria-labelledby="hero-title">
      <div className="eyebrow">Исследование кино через библейскую картину мира · избранный разбор</div>
      <div className="heroGrid">
        <div className="heroCopy">
          <p className="kicker">
            {featuredFilm.year} · {featuredFilm.director} · {featuredFilm.genre.join(", ")}
          </p>
          <h1 id="hero-title">{featuredFilm.title}</h1>
          <p className="lede">{featuredFilm.thesisQuestion}</p>
          <div className="heroActions">
            <Link className="buttonPrimary" href={`/films/${featuredFilm.slug}`}>Открыть разбор</Link>
            <Link className="buttonGhost" href="/methodology">Методология</Link>
          </div>
        </div>
        <div className="livingFrame" aria-label={`Кадр фильма ${featuredFilm.title}`}>
          <div className="frameMeta">
            <span>Кадр · 0001</span>
            <span>2.39:1</span>
          </div>
          <FrameScene />
          <div className="frameCaption">
            <strong>{featuredFilm.title}</strong>
            <span>{featuredFilm.premise}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function DataSections({ data, published }: { data: HomepageViewModel; published: boolean }) {
  const label = published ? "Разбор" : "Проекция";
  return (
    <section id="structural-stand" className="standShell" aria-labelledby="stand-title">
      <div className="sectionShell sectionRule">
        <div className="sectionIndex">{published ? "Материал / Проекция" : "Стенд / Проекция"}</div>
        <h2 id="stand-title">{published ? "Материал разбора." : "Структурный стенд: тестовые данные."}</h2>
        <p className="sectionIntro">
          {published
            ? "Спойлер-безопасная проекция избранного разбора: главная показывает метод и завязку, не раскрывая финала."
            : "Ниже — проекция структурной фикстуры платформы: контракты рендера, сцены и уровни спойлеров. Это не опубликованный разбор и не редакционное суждение. Тексты фикстуры оставлены на английском как тестовые данные."}
        </p>
      </div>

      <section className="sectionShell sectionRule splitSection" aria-labelledby="stand-story-title">
        <div>
          <div className="sectionIndex">{label} 01 / История</div>
          <h2 id="stand-story-title">Структура истории.</h2>
          <p className="sectionIntro">Завязка, эскалация и поворот — без финала на главной странице.</p>
        </div>
        <ol className="storyTrack">
          {data.storyBeats.map((beat, index) => (
            <li key={beat.label}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{beat.label}</strong><p>{beat.summary}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="sectionShell sectionRule" aria-labelledby="stand-people-title">
        <div className="sectionIndex">{label} 02 / Люди</div>
        <h2 id="stand-people-title">Люди несут аргумент фильма.</h2>
        <div className="characterGrid">
          {data.characters.map((character) => (
            <article className="characterCard" key={character.id}>
              <div className="portraitPlaceholder" aria-hidden="true" />
              <h3>{character.name}</h3>
              <dl>
                <div><dt>Хочет</dt><dd>{character.wants}</dd></div>
                <div><dt>Боится</dt><dd>{character.fears}</dd></div>
                <div><dt>Противоречие</dt><dd>{character.contradiction}</dd></div>
              </dl>
            </article>
          ))}
        </div>
        <div className="relationshipPanel" aria-labelledby="stand-relationship-title">
          <div>
            <span className="microLabel">Обсерватория отношений</span>
            <h3 id="stand-relationship-title">{data.relationship.label}</h3>
            <p>{data.relationship.summary}</p>
          </div>
          <ol className="relationshipTrace">
            {data.relationship.events.map((event) => (
              <li className={`traceEvent trace-${event.tone}`} key={event.id}>
                <span className="traceDot" aria-hidden="true" />
                <div><strong>{event.label}</strong><p>{event.change}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {data.familyYouth ? (
        <section className="sectionShell sectionRule splitSection" aria-labelledby="stand-family-title">
          <div>
            <div className="sectionIndex">{label} 03 / Семья и юность</div>
            <h2 id="stand-family-title">Какую взрослость моделирует история?</h2>
            <p className="sectionIntro">
              Родители, сверстники, власть, бунт и самостоятельность анализируются как отношения и ответственность.
            </p>
          </div>
          <div className="stackList">
            {data.familyYouth.map((item) => (
              <article key={item.label}><span className="microLabel">{item.label}</span><p>{item.observation}</p></article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="sectionShell sectionRule meaningSection" aria-labelledby="stand-meaning-title">
        <div className="sectionIndex">{label} 04 / Смысл</div>
        <p className="microLabel">Вопрос</p>
        <h2 id="stand-meaning-title">{data.meaning.question}</h2>
        <div className="meaningGrid">
          <div><span>Тема</span><strong>{data.meaning.theme}</strong></div>
          <div><span>Явная теза</span><strong>{data.meaning.apparentClaim}</strong></div>
          <div><span>Контрдоказательство</span><strong>{data.meaning.counterevidence}</strong></div>
          <div><span>Уверенность</span><strong>{confidenceLabels[data.meaning.confidence]}</strong></div>
        </div>
      </section>

      <section className="sectionShell sectionRule" aria-labelledby="stand-permission-title">
        <div className="sectionIndex">{label} 05 / Нарративное разрешение</div>
        <h2 id="stand-permission-title">Что фильм делает дорогим, нормальным или вознаграждённым?</h2>
        <div className="permissionField">
          {data.permissions.map((permission) => (
            <article key={permission.subject}>
              <span className="permissionState">{permissionStateLabels[permission.state]}</span>
              <h3>{permission.subject}</h3>
              <p>{permission.rationale}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sectionShell sectionRule splitSection" aria-labelledby="stand-craft-title">
        <div>
          <div className="sectionIndex">{label} 06 / Форма</div>
          <h2 id="stand-craft-title">Форма формирует симпатию.</h2>
        </div>
        <div className="stackList">
          {data.craft.map((item) => (
            <article key={item.device}><span className="microLabel">{item.device}</span><p>{item.effect}</p></article>
          ))}
        </div>
      </section>

      {data.sceneAutopsy ? (
        <section className="sectionShell sectionRule autopsySection" aria-labelledby="stand-autopsy-title">
          <div className="sectionIndex">{label} 07 / Вскрытие сцены</div>
          <div className="autopsyFrame" aria-hidden="true">
            <span>Сцена / {published ? "доказательство" : "фикстура"}</span>
            <div className="autopsyCrosshair" />
          </div>
          <div className="autopsyCopy">
            <h2 id="stand-autopsy-title">Доказательства раньше вывода.</h2>
            <dl className="autopsyGrid">
              <div><dt>Действие</dt><dd>{data.sceneAutopsy.act}</dd></div>
              <div><dt>Мотив</dt><dd>{data.sceneAutopsy.motive}</dd></div>
              <div><dt>Знание</dt><dd>{data.sceneAutopsy.knowledge}</dd></div>
              <div><dt>Давление</dt><dd>{data.sceneAutopsy.pressure}</dd></div>
              <div><dt>Последствие</dt><dd>{data.sceneAutopsy.consequence}</dd></div>
            </dl>
          </div>
        </section>
      ) : null}

      {data.decision ? (
        <section className="sectionShell sectionRule decisionSection" aria-labelledby="stand-decision-title">
          <div className="sectionIndex">{label} 08 / Решение и туман незнания</div>
          <h2 id="stand-decision-title">{data.decision.question}</h2>
          <div className="knowledgeGrid">
            <article>
              <span className="microLabel">Известно тогда</span>
              {data.decision.knownThen.map((item) => <p key={item}>{item}</p>)}
            </article>
            <article className="fogPanel">
              <span className="microLabel">Откроется позже</span>
              {data.decision.revealedLater.map((item) => <p key={item}>{item}</p>)}
            </article>
          </div>
        </section>
      ) : null}

      {data.biblicalSynthesis ? (
        <section className="sectionShell sectionRule biblicalSection" aria-labelledby="stand-biblical-title">
          <div className="sectionIndex">{label} 09 / Библейский синтез</div>
          <h2 id="stand-biblical-title">Норма — после описания.</h2>
          <ol className="synthesisSteps">
            <li><span>Наблюдение</span><p>{data.biblicalSynthesis.observation}</p></li>
            <li><span>Принцип</span><p>{data.biblicalSynthesis.principle}</p></li>
            <li><span>Применение</span><p>{data.biblicalSynthesis.application}</p></li>
            <li><span>Оговорка</span><p>{data.biblicalSynthesis.qualification}</p></li>
          </ol>
        </section>
      ) : null}

      <section className="sectionShell sectionRule discoverySection" aria-labelledby="stand-discovery-title">
        <div>
          <div className="sectionIndex">{label} 10 / Навигация</div>
          <h2 id="stand-discovery-title">Каждый разбор углубляет атлас.</h2>
          <p className="sectionIntro">
            Фильмы связываются темами, отношениями, дилеммами и библейскими принципами — не сводясь к одному баллу.
          </p>
        </div>
        <div className="discoveryLinks">
          <Link href="/films">Все фильмы</Link>
          <Link href="/#lenses">Шесть линз</Link>
          <Link href="/methodology">Методология</Link>
        </div>
      </section>
    </section>
  );
}

export default function HomePage() {
  const previewContentEnabled = isPreviewContentEnabled();
  const isPublished = featuredFilmPackage.film.status === "published";

  if (!isPublished && !previewContentEnabled) {
    return <PlatformLanding preview={false} />;
  }

  const data = projectHomepage(featuredFilmPackage);

  if (isPublished) {
    return (
      <>
        <FilmHero data={data} />
        <LensStage />
        <DataSections data={data} published />
      </>
    );
  }

  return (
    <>
      <PlatformLanding preview />
      <DataSections data={data} published={false} />
    </>
  );
}
