(function (global) {
  const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  function indexFor(row, col) {
    return row * 9 + col;
  }

  function cellRef(row, col) {
    return [row, col];
  }

  function getCandidates(board, row, col) {
    const index = indexFor(row, col);
    if (board[index]) return [];

    const used = new Set();
    const blockRow = Math.floor(row / 3) * 3;
    const blockCol = Math.floor(col / 3) * 3;

    for (let i = 0; i < 9; i += 1) {
      used.add(board[indexFor(row, i)]);
      used.add(board[indexFor(i, col)]);
    }

    for (let r = blockRow; r < blockRow + 3; r += 1) {
      for (let c = blockCol; c < blockCol + 3; c += 1) {
        used.add(board[indexFor(r, c)]);
      }
    }

    return DIGITS.filter((digit) => !used.has(digit));
  }

  function getAllCandidates(board) {
    return Array.from({ length: 9 }, (_, row) => (
      Array.from({ length: 9 }, (_, col) => getCandidates(board, row, col))
    ));
  }

  function wrongCells(board, solution) {
    const cells = [];
    board.forEach((value, index) => {
      if (!value || value === solution[index]) return;
      cells.push(cellRef(Math.floor(index / 9), index % 9));
    });
    return cells;
  }

  function isSafeAnswer(row, col, digit, solution) {
    return solution[indexFor(row, col)] === digit;
  }

  function hintBase(type, digit, row, col, area) {
    return { type, digit, row, col, area };
  }

  function findNakedSingle(board, solution) {
    const allCandidates = getAllCandidates(board);
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        const candidates = allCandidates[row][col];
        if (candidates.length !== 1) continue;
        const digit = candidates[0];
        if (!isSafeAnswer(row, col, digit, solution)) continue;
        return hintBase("naked-single", digit, row, col, { type: "cell", row, col });
      }
    }
    return null;
  }

  function findHiddenSingleInBlock(board, solution) {
    const allCandidates = getAllCandidates(board);
    for (let blockRow = 0; blockRow < 3; blockRow += 1) {
      for (let blockCol = 0; blockCol < 3; blockCol += 1) {
        const cells = [];
        for (let row = blockRow * 3; row < blockRow * 3 + 3; row += 1) {
          for (let col = blockCol * 3; col < blockCol * 3 + 3; col += 1) {
            cells.push({ row, col, candidates: allCandidates[row][col] });
          }
        }

        for (const digit of DIGITS) {
          const possible = cells.filter((cell) => cell.candidates.includes(digit));
          if (possible.length !== 1) continue;
          const cell = possible[0];
          if (!isSafeAnswer(cell.row, cell.col, digit, solution)) continue;
          return hintBase("hidden-single-block", digit, cell.row, cell.col, {
            type: "block",
            blockRow,
            blockCol
          });
        }
      }
    }
    return null;
  }

  function findHiddenSingleInRow(board, solution) {
    const allCandidates = getAllCandidates(board);
    for (let row = 0; row < 9; row += 1) {
      for (const digit of DIGITS) {
        const possible = [];
        for (let col = 0; col < 9; col += 1) {
          if (allCandidates[row][col].includes(digit)) possible.push({ row, col });
        }
        if (possible.length !== 1) continue;
        const cell = possible[0];
        if (!isSafeAnswer(cell.row, cell.col, digit, solution)) continue;
        return hintBase("hidden-single-row", digit, cell.row, cell.col, { type: "row", row });
      }
    }
    return null;
  }

  function findHiddenSingleInColumn(board, solution) {
    const allCandidates = getAllCandidates(board);
    for (let col = 0; col < 9; col += 1) {
      for (const digit of DIGITS) {
        const possible = [];
        for (let row = 0; row < 9; row += 1) {
          if (allCandidates[row][col].includes(digit)) possible.push({ row, col });
        }
        if (possible.length !== 1) continue;
        const cell = possible[0];
        if (!isSafeAnswer(cell.row, cell.col, digit, solution)) continue;
        return hintBase("hidden-single-column", digit, cell.row, cell.col, { type: "column", col });
      }
    }
    return null;
  }

  function areaText(area) {
    if (!area) return "このマス";
    if (area.type === "row") return `上から${area.row + 1}行目`;
    if (area.type === "column") return `左から${area.col + 1}列目`;
    if (area.type === "block") return `上から${area.blockRow + 1}段目・左から${area.blockCol + 1}列目の3x3ブロック`;
    return "このマス";
  }

  function coordText(row, col) {
    return `上から${row + 1}行目・左から${col + 1}列目`;
  }

  function valuesInRow(board, row) {
    return DIGITS.filter((digit) => board.slice(row * 9, row * 9 + 9).includes(digit));
  }

  function valuesInColumn(board, col) {
    return DIGITS.filter((digit) => Array.from({ length: 9 }, (_, row) => board[indexFor(row, col)]).includes(digit));
  }

  function valuesInBlock(board, row, col) {
    const blockRow = Math.floor(row / 3) * 3;
    const blockCol = Math.floor(col / 3) * 3;
    const values = [];
    for (let r = blockRow; r < blockRow + 3; r += 1) {
      for (let c = blockCol; c < blockCol + 3; c += 1) {
        const value = board[indexFor(r, c)];
        if (value) values.push(value);
      }
    }
    return DIGITS.filter((digit) => values.includes(digit));
  }

  function digitList(values) {
    return values.length ? values.join("、") : "まだ数字がありません";
  }

  function possibleCellsForDigit(board, area, digit) {
    const cells = [];
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        if (area.type === "row" && row !== area.row) continue;
        if (area.type === "column" && col !== area.col) continue;
        if (area.type === "block") {
          if (Math.floor(row / 3) !== area.blockRow || Math.floor(col / 3) !== area.blockCol) continue;
        }
        if (getCandidates(board, row, col).includes(digit)) cells.push(cellRef(row, col));
      }
    }
    return cells;
  }

  function buildHintSteps(hint, board) {
    if (!hint || hint.message) return [];
    const targetCell = cellRef(hint.row, hint.col);

    if (hint.type === "naked-single") {
      const candidates = board ? getCandidates(board, hint.row, hint.col) : [hint.digit];
      const rowValues = board ? valuesInRow(board, hint.row) : [];
      const colValues = board ? valuesInColumn(board, hint.col) : [];
      const blockValues = board ? valuesInBlock(board, hint.row, hint.col) : [];
      return [
        {
          title: "見る場所",
          text: `${coordText(hint.row, hint.col)}の空きマスを見ます。まず同じ行・同じ列・同じ3x3ブロックを確認します。`,
          highlight: { type: "cell", row: hint.row, col: hint.col }
        },
        {
          title: "候補を消す",
          text: `同じ行には ${digitList(rowValues)}、同じ列には ${digitList(colValues)}、同じ3x3ブロックには ${digitList(blockValues)} があります。これらの数字はこのマスには入りません。`,
          highlight: { type: "cell", row: hint.row, col: hint.col }
        },
        {
          title: "残った候補",
          text: `1〜9から消していくと、残る候補は ${candidates.join("、")} です。候補が1つだけなので、このマスは確定できます。`,
          highlight: { type: "cell", row: hint.row, col: hint.col }
        },
        {
          title: "答え",
          text: `したがって、${coordText(hint.row, hint.col)}には${hint.digit}が入ります。`,
          highlight: { type: "cell", row: hint.row, col: hint.col }
        }
      ];
    }

    const subject = areaText(hint.area);
    const possibleCells = board ? possibleCellsForDigit(board, hint.area, hint.digit) : [targetCell];
    const possibleText = possibleCells.map(([row, col]) => coordText(row, col)).join("、");
    return [
      {
        title: "見る場所",
        text: `${subject}の中で、${hint.digit}を置ける場所を探します。数独では同じ行・列・3x3ブロックに同じ数字は入りません。`,
        highlight: hint.area
      },
      {
        title: "候補を探す",
        text: `${hint.digit}を仮に置けるマスだけを残すと、候補は ${possibleText} です。ほかのマスは同じ行・列・ブロックの数字とぶつかります。`,
        highlight: { type: "cells", cells: [targetCell], area: hint.area }
      },
      {
        title: "1か所だけ",
        text: `${subject}の中で${hint.digit}が入れる場所は1か所だけです。つまり、このマスを確定できます。`,
        highlight: { type: "cells", cells: [targetCell], area: hint.area }
      },
      {
        title: "答え",
        text: `したがって、${coordText(hint.row, hint.col)}には${hint.digit}が入ります。`,
        highlight: { type: "cell", row: hint.row, col: hint.col, area: hint.area }
      }
    ];
  }

  function getNextHint(board, solution) {
    const incorrect = wrongCells(board, solution);
    if (incorrect.length) {
      return {
        type: "invalid-board",
        message: "まず間違っているマスを見直してください",
        wrongCells: incorrect,
        steps: []
      };
    }

    const hint = (
      findNakedSingle(board, solution)
      || findHiddenSingleInBlock(board, solution)
      || findHiddenSingleInRow(board, solution)
      || findHiddenSingleInColumn(board, solution)
    );

    if (!hint) {
      return {
        type: "not-found",
        message: "基本ヒントでは次の一手を見つけられませんでした。今後、上級ヒントを追加予定です。",
        steps: []
      };
    }

    hint.steps = buildHintSteps(hint, board);
    return hint;
  }

  function applyHintAnswer(board, hint) {
    if (!hint || typeof hint.row !== "number" || typeof hint.col !== "number") return board;
    const next = [...board];
    next[indexFor(hint.row, hint.col)] = hint.digit;
    return next;
  }

  const api = {
    getCandidates,
    getAllCandidates,
    findNakedSingle,
    findHiddenSingleInRow,
    findHiddenSingleInColumn,
    findHiddenSingleInBlock,
    buildHintSteps,
    getNextHint,
    applyHintAnswer
  };

  global.QUIET_SUDOKU_HINTS = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
