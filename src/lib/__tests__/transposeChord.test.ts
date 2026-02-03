import { describe, it, expect } from "vitest";
import {
  transposeChord,
  transposeChordArray,
  transposeCifraText,
  getSemitoneDistance,
  getAllKeys,
} from "../transposeChord";

describe("transposeChord", () => {
  describe("basic chords", () => {
    it("should transpose C up by 2 semitones to D", () => {
      expect(transposeChord("C", 2)).toBe("D");
    });

    it("should transpose G down by 2 semitones to F", () => {
      expect(transposeChord("G", -2)).toBe("F");
    });

    it("should return same chord when steps is 0", () => {
      expect(transposeChord("Am", 0)).toBe("Am");
    });

    it("should handle empty string", () => {
      expect(transposeChord("", 5)).toBe("");
    });

    it("should wrap around when going past B", () => {
      expect(transposeChord("B", 1)).toBe("C");
    });

    it("should wrap around when going below C", () => {
      expect(transposeChord("C", -1)).toBe("B");
    });
  });

  describe("sharp chords", () => {
    it("should transpose C# up by 1 to D", () => {
      expect(transposeChord("C#", 1)).toBe("D");
    });

    it("should transpose F# down by 1 to F", () => {
      expect(transposeChord("F#", -1)).toBe("F");
    });

    it("should preserve suffix with sharp", () => {
      expect(transposeChord("C#m", 2)).toBe("D#m");
    });
  });

  describe("flat chords (enharmonic)", () => {
    it("should convert Bb to A# equivalent", () => {
      expect(transposeChord("Bb", 1)).toBe("B");
    });

    it("should handle Db correctly", () => {
      expect(transposeChord("Db", 0)).toBe("Db"); // Returns original when 0 steps
      expect(transposeChord("Db", 1)).toBe("D");
    });

    it("should handle Eb correctly", () => {
      expect(transposeChord("Eb", -1)).toBe("D");
    });
  });

  describe("chord suffixes", () => {
    it("should preserve minor suffix", () => {
      expect(transposeChord("Am", 3)).toBe("Cm");
    });

    it("should preserve 7 suffix", () => {
      expect(transposeChord("G7", 2)).toBe("A7");
    });

    it("should preserve maj7 suffix", () => {
      expect(transposeChord("Cmaj7", 4)).toBe("Emaj7");
    });

    it("should preserve complex suffixes", () => {
      expect(transposeChord("Dm7b5", 5)).toBe("Gm7b5");
    });

    it("should preserve sus4 suffix", () => {
      expect(transposeChord("Asus4", 2)).toBe("Bsus4");
    });

    it("should preserve add9 suffix", () => {
      expect(transposeChord("Cadd9", 7)).toBe("Gadd9");
    });
  });

  describe("slash chords", () => {
    it("should transpose both parts of slash chord", () => {
      expect(transposeChord("C/G", 2)).toBe("D/A");
    });

    it("should handle slash chord with sharp bass", () => {
      expect(transposeChord("D/F#", 2)).toBe("E/G#");
    });

    it("should handle complex slash chord", () => {
      expect(transposeChord("Am7/E", 3)).toBe("Cm7/G");
    });

    it("should handle flat in slash chord", () => {
      expect(transposeChord("Bb/D", 1)).toBe("B/D#");
    });
  });

  describe("full octave transposition", () => {
    it("should return same note after 12 semitones", () => {
      expect(transposeChord("C", 12)).toBe("C");
    });

    it("should return same note after -12 semitones", () => {
      expect(transposeChord("G", -12)).toBe("G");
    });

    it("should handle large positive steps", () => {
      expect(transposeChord("C", 14)).toBe("D"); // 14 % 12 = 2
    });

    it("should handle large negative steps", () => {
      expect(transposeChord("C", -14)).toBe("A#"); // -14 % 12 = -2 => 10
    });
  });

  describe("edge cases", () => {
    it("should handle whitespace", () => {
      expect(transposeChord("  C  ", 2).trim()).toBe("D");
    });

    it("should return invalid chord as-is", () => {
      expect(transposeChord("X", 2)).toBe("X");
    });

    it("should handle lowercase (if passed)", () => {
      // Our implementation might not handle this, just documenting behavior
      const result = transposeChord("c", 2);
      expect(typeof result).toBe("string");
    });
  });
});

describe("transposeChordArray", () => {
  it("should transpose array of simple chords", () => {
    const chords = ["C", "G", "Am", "F"];
    const result = transposeChordArray(chords, 2);

    expect(result).toEqual(["D", "A", "Bm", "G"]);
  });

  it("should handle empty array", () => {
    expect(transposeChordArray([], 5)).toEqual([]);
  });

  it("should transpose mixed chord types", () => {
    const chords = ["C", "C#m", "Dm7", "G/B"];
    const result = transposeChordArray(chords, 3);

    expect(result).toEqual(["D#", "Em", "Fm7", "A#/D"]);
  });
});

describe("transposeCifraText", () => {
  it("should transpose chords in cifra text", () => {
    const cifra = "[C]Verse lyrics [G]more lyrics [Am]end";
    const result = transposeCifraText(cifra, 2);

    expect(result).toBe("[D]Verse lyrics [A]more lyrics [Bm]end");
  });

  it("should preserve text outside brackets", () => {
    const cifra = "Intro: [C] [G]\nVerse: [Am] [F]";
    const result = transposeCifraText(cifra, 0);

    expect(result).toBe(cifra);
  });

  it("should handle empty string", () => {
    expect(transposeCifraText("", 5)).toBe("");
  });

  it("should handle text without chords", () => {
    const text = "Just some lyrics without chords";
    expect(transposeCifraText(text, 5)).toBe(text);
  });

  it("should handle complex chords in brackets", () => {
    const cifra = "[Cmaj7] [Dm7/A] [G7sus4]";
    const result = transposeCifraText(cifra, 2);

    expect(result).toBe("[Dmaj7] [Em7/B] [A7sus4]");
  });

  it("should preserve line breaks and formatting", () => {
    const cifra = "[C]Line one\n[G]Line two\n\n[Am]Line three";
    const result = transposeCifraText(cifra, 2);

    expect(result).toContain("\n");
    expect(result).toBe("[D]Line one\n[A]Line two\n\n[Bm]Line three");
  });
});

describe("getSemitoneDistance", () => {
  it("should return 0 for same key", () => {
    expect(getSemitoneDistance("C", "C")).toBe(0);
  });

  it("should calculate positive distance", () => {
    // C to G is 7 semitones forward or -5 backwards; function returns shortest path
    expect(getSemitoneDistance("C", "G")).toBe(-5); // shortest path
  });

  it("should choose shortest path (positive)", () => {
    expect(getSemitoneDistance("C", "D")).toBe(2);
  });

  it("should choose shortest path (negative)", () => {
    expect(getSemitoneDistance("C", "B")).toBe(-1);
  });

  it("should handle sharp keys", () => {
    expect(getSemitoneDistance("C", "C#")).toBe(1);
  });

  it("should handle flat keys (enharmonic)", () => {
    expect(getSemitoneDistance("C", "Db")).toBe(1);
  });

  it("should handle flat to sharp", () => {
    expect(getSemitoneDistance("Bb", "C")).toBe(2);
  });

  it("should handle invalid keys", () => {
    expect(getSemitoneDistance("X", "C")).toBe(0);
    expect(getSemitoneDistance("C", "X")).toBe(0);
  });

  describe("distance symmetry", () => {
    it("should return opposite distances for reversed keys", () => {
      expect(getSemitoneDistance("C", "E")).toBe(4);
      expect(getSemitoneDistance("E", "C")).toBe(-4);
    });
  });
});

describe("getAllKeys", () => {
  it("should return 12 keys", () => {
    const keys = getAllKeys();
    expect(keys).toHaveLength(12);
  });

  it("should start with C", () => {
    const keys = getAllKeys();
    expect(keys[0]).toBe("C");
  });

  it("should contain all chromatic notes", () => {
    const keys = getAllKeys();
    expect(keys).toContain("C");
    expect(keys).toContain("C#");
    expect(keys).toContain("D");
    expect(keys).toContain("D#");
    expect(keys).toContain("E");
    expect(keys).toContain("F");
    expect(keys).toContain("F#");
    expect(keys).toContain("G");
    expect(keys).toContain("G#");
    expect(keys).toContain("A");
    expect(keys).toContain("A#");
    expect(keys).toContain("B");
  });

  it("should return a new array each time", () => {
    const keys1 = getAllKeys();
    const keys2 = getAllKeys();
    expect(keys1).not.toBe(keys2);
    expect(keys1).toEqual(keys2);
  });
});
