import _ from 'lodash';
import fs from "fs";
import path from "path";

class Utils {
  static upperCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  static deleteImages(array, deleteImages, direction) {
    for (let i = 0; i < deleteImages.length; i++) {
      console.log('utils array', array)
      array = array.filter(e => e !== deleteImages[i]);
      fs.unlinkSync(path.join(direction, deleteImages[i]));
    }
    return array;
  }

  static removeFromId(array, stringArray) {
    stringArray.map(i => _.remove(array, function (n) {
      return +i === +n.id
    }))
  }
  static sliceText(text, maxLetters = 10) {
    if (text.length > maxLetters) {
      return text.slice(0, maxLetters) + '..'
    } else {
      return text
    }
  }
  static getPosition(options) {
    return new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, options)
    );
  }

}

export default Utils;
