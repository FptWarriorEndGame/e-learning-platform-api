import request from "supertest";
import app from "../app";
const port = process.env.PORT || 9000;

describe("Test console.log", () => {
    let consoleOutput = [];
    const originalLog = console.log;
  
    beforeEach(() => {
      consoleOutput = [];
      console.log = (message) => consoleOutput.push(message);
    });
  
    afterEach(() => {
      console.log = originalLog;
    });
  
    test("console.log outputs the expected message", () => {
      console.log(`App listening on port ${port}`);
      expect(consoleOutput).toEqual([`App listening on port ${port}`]);
    });
  });