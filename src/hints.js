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
      if (!value) return;
      if (value === solution[index]) return;
      cells.push(cellRef(Math.floor(index / 9), index % 9));
    });
    return cells;
  }

  function isSafeAnswer(row, col, digit, solution) {
    return solution[indexFor(row, col)] === digit;
  }

  function hintBase(type, digit, row, col, area) {
    return {
      type,
      digit,
      row,
      col,
      area
    };
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
    if (area.type === "row") return "この行";
    if (area.type === "column") return "この列";
    if (area.type === "block") return "このブロック";
    return "このマス";
  }

  function buildHintSteps(hint) {
    if (!hint || hint.message) return [];
    const targetCell = cellRef(hint.row, hint.col);
    if (hint.type === "naked-single") {
      return [
        {
          title: "注目する場所",
          text: "このマスに注目してください。",
          highlight: { type: "cell", row: hint.row, col: hint.col }
        },
        {
          title: "候補を確認",
          text: `行・列・3x3ブロックを見ると、このマスに入る候補は${hint.digit}だけです。`,
          highlight: { type: "cell", row: hint.row, col: hint.col }
        },
        {
          title: "答え",
          text: `そのため、このマスには${hint.digit}が入ります。`,
          highlight: { type: "cell", row: hint.row, col: hint.col }
        }
      ];
    }

    const subject = areaText(hint.area);
    return [
      {
        title: "注目する場所",
        text: `${subject}に注目してください。`,
        highlight: hint.area
      },
      {
        title: "候補を確認",
        text: `${subject}では${hint.digit}が入る可能性のあるマスが1つだけです。`,
        highlight: { type: "cells", cells: [targetCell], area: hint.area }
      },
      {
        title: "答え",
        text: `そのため、このマスには${hint.digit}が入ります。`,
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

    hint.steps = buildHintSteps(hint);
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
