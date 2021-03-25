import data from '../data/data'

class ExamenCantroller {

  static data = async (req, res, next) => {
    try {

      res.send({
        status: 'ok',
        data,
      });
    } catch (e) {
      next(e);
    }
  };


}

export default ExamenCantroller;
