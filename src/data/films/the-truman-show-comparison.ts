import type { FilmComparison } from "@/lib/film-package";

/**
 * The comparison remains part of the canonical film package and is projected
 * server-side. The historical case is Charter 77, not the hypothetical
 * greengrocer in Havel's essay. Facts, interpretation and limits stay distinct.
 */
export const trumanComparison: FilmComparison = {
  id: "truman-comparison",
  heading: "Один выбор — разные условия",
  spoilerLevel: "ENDING",
  introduction:
    "Сравните двух участников по одним и тем же вопросам. Не кто «лучше», а что каждый знал, какие имел возможности и какую цену платил. По умолчанию — вымышленный Труман и реальный Вацлав Гавел времён Хартии 77.",
  limitation:
    "Это аналогия, а не равенство тоталитарного государства и киностудии. Труман — вымышленный герой, Гавел действовал вместе с другими людьми в реальных исторических обстоятельствах. Мы не восстанавливаем чужие мысли и не назначаем победителя.",
  sources: [
    {
      id: "havel-library",
      label: "Библиотека Вацлава Гавела: диссидент, 1969–1989",
      url: "https://www.vaclavhavel.cz/en/vaclav-havel/dissident",
      scope: "Хартия 77, роль Гавела, арест 1977 года и VONS; биографическая хронология.",
    },
    {
      id: "havel-essay",
      label: "Вацлав Гавел, «Сила бессильных» (фрагменты эссе, 1978)",
      url: "https://history.hanover.edu/courses/excerpts/165havel.html",
      scope: "Первичный текст об участии во лжи; овощник — гипотетический образ, не сам Гавел.",
    },
    {
      id: "havel-letter",
      label: "The Nation: биографический очерк о Гавеле (2012)",
      url: "https://www.thenation.com/article/archive/havels-specter-vaclav-havel/",
      scope: "Поздняя биографическая статья о письме с просьбой об освобождении и последующем сожалении Гавела.",
    },
    {
      id: "havel-radio",
      label: "Radio Prague International: найденный текст Гавела (2021)",
      url: "https://english.radio.cz/havels-regrets-over-prison-comprise-spiritual-core-freshly-published-lost-text-8733735",
      scope: "Интервью с директором библиотеки о компромиссе в заключении и самооценке Гавела в найденной рукописи.",
    },
  ],
  sides: [
    {
      id: "truman",
      name: "Труман Бёрбанк",
      kind: "FICTIONAL",
      characterId: "truman-ch-truman",
      context: "Герой фильма у границы съёмочного мира, после шторма и разговора с Кристофом.",
      cells: {
        knowledge: { text: "Он знает, что мир вокруг него сконструирован и что Кристоф управлял его жизнью; о мире за дверью он почти ничего не знает.", evidenceIds: ["truman-ev-dialog", "truman-ev-nocamera"] },
        pressure: { text: "Его только что пытались остановить штормом; голос Кристофа предлагает знакомую безопасность вместо неизвестности.", evidenceIds: ["truman-ev-storm", "truman-ev-dialog"] },
        options: { text: "Вернуться в знакомый, но управляемый мир или выйти в неизвестность. Цена каждого варианта оценивается из его положения, а не с позиции всезнающего зрителя.", evidenceIds: ["truman-ev-dialog", "truman-ev-exit"] },
        decision: { text: "Он отвечает привычным приветствием, кланяется и проходит через дверь. Жест можно читать как возвращение контроля над собственной ролью.", evidenceIds: ["truman-ev-exit"] },
        cost: { text: "Выход означает потерю привычного дома и отношений, в достоверности которых он теперь не уверен; фильм не гарантирует ему безопасность снаружи.", evidenceIds: ["truman-ev-dialog", "truman-ev-exit"] },
        consequences: { text: "Эфир его жизни в прежнем виде заканчивается. Фильм не показывает, как складывается его дальнейшая жизнь.", evidenceIds: ["truman-ev-exit"] },
        counterpoint: { text: "Кристоф справедливо напоминает, что внешний мир тоже может быть жестоким. Но опасность снаружи не делает согласие на пожизненный обман добровольным.", evidenceIds: ["truman-ev-dialog"] },
      },
    },
    {
      id: "havel",
      name: "Вацлав Гавел",
      kind: "HISTORICAL",
      context: "Реальный чехословацкий писатель и диссидент: выбор вокруг Хартии 77 и его последствия в 1977–1978 годах.",
      cells: {
        knowledge: { text: "Он уже знал о цензуре и преследовании и вместе с другими требовал соблюдения прав, на которые государство само ссылалось. Эссе 1978 года написано позднее этих событий.", sourceIds: ["havel-library", "havel-essay"] },
        pressure: { text: "Участие в правозащитной инициативе происходило в условиях наблюдения и государственного преследования; в январе 1977 года Гавел был арестован.", sourceIds: ["havel-library"] },
        options: { text: "Публично поддержать Хартию или не выступать было неравноценным выбором с разными рисками. Полный перечень лично рассмотренных им вариантов источник не восстанавливает.", sourceIds: ["havel-library"] },
        decision: { text: "Гавел стал соавтором текста Хартии 77 и одним из трёх первых пресс-секретарей движения; это коллективное действие, а не одиночный побег.", sourceIds: ["havel-library"] },
        cost: { text: "С января по май 1977 года он находился под арестом; позднее получил условный приговор. Его коллега Ян Паточка умер после полицейских допросов.", sourceIds: ["havel-library"] },
        consequences: { text: "Правозащитная работа продолжилась: в 1978 году Гавел участвовал в создании комитета VONS. Причины дальнейших событий нельзя свести к одному человеку.", sourceIds: ["havel-library"] },
        counterpoint: { text: "Биографическая статья рассказывает о его письме с просьбой об освобождении, а директор библиотеки — о сожалении Гавела по поводу компромисса. Это не отменяет работы движения, но мешает рисовать безошибочного героя.", sourceIds: ["havel-letter", "havel-radio"] },
      },
    },
    {
      id: "christof",
      name: "Кристоф",
      kind: "FICTIONAL",
      characterId: "truman-ch-christof",
      context: "Создатель телешоу в момент, когда теряет контроль над Труманом.",
      cells: {
        knowledge: { text: "Он знает устройство декорации и скрытую от Трумана историю шоу, но не может знать мысли героя целиком.", evidenceIds: ["truman-ev-dialog", "truman-ev-nocamera"] },
        pressure: { text: "Исчезновение героя угрожает непрерывному эфиру и власти Кристофа над построенным миром.", evidenceIds: ["truman-ev-escape"] },
        options: { text: "Он мог позволить Труману уйти, попытаться убедить его остаться или продолжать физически удерживать; последняя возможность показана штормом.", evidenceIds: ["truman-ev-storm", "truman-ev-dialog"] },
        decision: { text: "Кристоф использует шторм, затем разговаривает с Труманом и убеждает его остаться в Сихейвене.", evidenceIds: ["truman-ev-storm", "truman-ev-dialog"] },
        cost: { text: "Когда герой уходит, Кристоф теряет контроль над жизнью, которой он управлял. Неизвестно, что будет с ним после эфира.", evidenceIds: ["truman-ev-exit"] },
        consequences: { text: "Попытка удержать человека ставит его жизнь под угрозу; финальный выбор остаётся за самим Труманом.", evidenceIds: ["truman-ev-storm", "truman-ev-exit"] },
        counterpoint: { text: "Его забота о защищённом мире может быть искренней, но искренность не отменяет принуждения и отсутствия согласия.", evidenceIds: ["truman-ev-dialog", "truman-ev-storm"] },
      },
    },
  ],
};
