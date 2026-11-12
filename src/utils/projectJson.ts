type Check = (value: unknown) => boolean;
type Fields = Record<string, Check>;

const text = (value: unknown) => typeof value === "string";
const number = (value: unknown) => typeof value === "number" && Number.isFinite(value);
const boolean = (value: unknown) => typeof value === "boolean";
const date = (value: unknown) =>
  typeof value === "string" && Number.isFinite(Date.parse(value));

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function list(check: Check): Check {
  return (value) => Array.isArray(value) && value.every(check);
}

function record(check: Check): Check {
  return (value) => isRecord(value) && Object.values(value).every(check);
}

// 省略できるのは、型上の任意項目と既存の正規化で補完できる項目。
function object(required: Fields, optional: Fields = {}): Check {
  return (value) => isRecord(value)
    && Object.entries(required).every(([key, check]) => check(value[key]))
    && Object.entries(optional).every(([key, check]) => value[key] === undefined || check(value[key]));
}

const strings = list(text);
const character = object({}, {
  id: text,
  name: text,
  roleType: text,
  isCulpritCandidate: boolean,
  profession: text,
  location: text,
  introduction: text,
  initialItems: strings,
  capabilities: list(object({
    id: text, name: text, description: text, targetPhase: number,
  }, { unlockedEvidenceIds: strings })),
  handout: object({}, {
    publicProfile: text,
    internalDrama: object({}, { pride: text, guilt: text, loss: text }),
    backgroundTimeline: text,
    handoutBody: text,
    gmActionGuide: text,
  }),
});

const evidence = object({}, {
  id: text, title: text, frontTitleHtml: text, description: text,
  glossaryNote: text, ownerId: text, foundPhase: number, visibility: text,
  acquisitionCondition: text, category: text,
});

const phase = object({}, {
  dayNumber: number, locationName: text, distanceKm: number, resourceStatus: text,
  situationTitle: text, incidentOverview: text, hqResponse: text,
  fieldResponse: text, revealedEvidenceIds: strings,
});

const visual = object({
  id: text, title: text, subtitle: text, boardType: text, dayNumber: number,
}, {
  captionTitle: text, captionBody: text, annotations: strings, imageUrl: text,
  showGmSecrets: boolean, orientation: text, hasWhiteMargin: boolean,
});

const cardFields = {
  id: text, cardCode: text, title: text, description: text,
};

const project = object({
  title: text,
  characters: list(character),
}, {
  id: text, scenarioPackId: text, createdAt: date, updatedAt: date, subtitle: text,
  concept: text, targetExperience: text, plotSummary: text, gimmickOverview: text,
  playerCount: number, durationHours: number, hasGm: boolean,
  evidences: list(evidence),
  timeline: list(phase),
  crypticWords: list(object({
    id: text, symbol: text, meaning: text, soundPattern: text,
    assignedCharId: text, clueSource: text,
  })),
  crypticGrammar: object({}, {
    ruleDescription: text, correctSequence: strings, combinedMessage: text, holderCharId: text,
  }),
  matrixLinks: list(object({
    id: text, evidenceId: text, characterId: text, specializedKnowledge: text,
    derivedConclusion: text, isCrucialForSolution: boolean,
  })),
  lockCriteria: list(object({ id: text, name: text, description: text })),
  candidateStatuses: list(object({
    characterId: text, locks: record(boolean), rebuttalNote: text,
  })),
  documentDesigns: record(object({
    themeId: text, accentColor: text, paperStyle: text, borderStyle: text,
    fontFamily: text, stampText: text, organizationHeader: text, documentCode: text,
    footerNote: text,
  }, { customPromptUsed: text })),
  visualBoards: list(visual),
  gmNotes: record(object({
    dayNumber: number, targetMinutes: number, readAloudScript: text,
    gmCheckpoints: strings, bgmCue: text,
  })),
  specialCharacterCards: list(object({
    ...cardFields, characterId: text, characterName: text, profession: text,
    revealDayLabel: text, revealDayNumber: number, categoryLabel: text, accentHex: text,
  }, { frontTitleHtml: text, rubyHtml: text, glossaryNote: text, fivePlayerFallbackNote: text })),
  nagatsuPhaseCards: list(object({
    ...cardFields, dayNumber: number, timingBadge: text, rubyHtml: text,
  }, { frontTitleHtml: text })),
});

export function isProjectJson(value: unknown): value is Record<string, unknown> & { title: string } {
  return project(value);
}
