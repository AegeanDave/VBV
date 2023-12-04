const fileManager = wx.getFileSystemManager();
const BASE_FILE_NAME = 'QRcode.jpg';

const bufferData = (data: any) => {
  return new Promise((resolve, reject) => {
    const filePath = `${wx.env.USER_DATA_PATH}/${BASE_FILE_NAME}`;
    fileManager.writeFile({
      filePath,
      data: data,
      encoding: 'binary',
      success: () => { resolve(filePath); },
      fail: () => {
        reject(new Error('WRITE BASE64SRC ERROR'));
      },
    });
  });
};

export default bufferData




