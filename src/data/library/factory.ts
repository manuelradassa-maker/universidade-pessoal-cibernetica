import { BookRole, EvidenceClass, LibraryEntry, LibraryList, LibraryTier, ReadDepth, V8StageId } from '../../types';

/**
 * Registo compacto de livro (linha de dados).
 * Ordem dos campos:
 * [rank, título, autor, ano, domínio, estágio, dificuldade(1-5), extensão,
 *  contribuição central, por que merece inclusão, melhor aplicação prática,
 *  limitação/risco, profundidade de leitura, papel, classe de evidência, tier]
 *
 * `whatItDevelops` é derivado do domínio (o domínio É a capacidade a
 * desenvolver), evitando repetição artificial de texto no registo.
 * `rereadValue` decorre da profundidade de leitura atribuída.
 */
export type LibraryRow = [
  number,
  string,
  string,
  number,
  string,
  V8StageId,
  1 | 2 | 3 | 4 | 5,
  string,
  string,
  string,
  string,
  string,
  ReadDepth,
  BookRole,
  EvidenceClass,
  LibraryTier
];

export const buildList = (list: LibraryList, rows: LibraryRow[]): LibraryEntry[] =>
  rows.map((r) => ({
    rank: r[0],
    list,
    title: r[1],
    author: r[2],
    year: r[3],
    domain: r[4],
    stage: r[5],
    difficulty: r[6],
    durationOrPages: r[7],
    coreContribution: r[8],
    whyIncluded: r[9],
    whatItDevelops: r[4],
    bestPracticalApplication: r[10],
    criticalWarning: r[11],
    readDepth: r[12],
    role: r[13],
    evidenceClass: r[14],
    tier: r[15],
    rereadValue: r[12] === 'Master' ? 'Alto' : r[12] === 'Study' ? 'Médio' : 'Baixo'
  }));
