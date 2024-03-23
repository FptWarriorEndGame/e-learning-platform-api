import * as fs from "fs";

const deleteFile = (filePath: string): void => {
  fs.unlink(filePath, (err: NodeJS.ErrnoException | null) => {
    if (err) {
      throw err;
    }
  });
};

export { deleteFile };
