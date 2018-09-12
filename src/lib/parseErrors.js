import { flashWithError } from "../components/FlashMessages";
export default err => {
  const { error, errors } = err.response.data;

  if (error) {
    const errorMap = new Map(Object.entries(error));

    if (error.name === "MongoError") flashWithError(error.message);
    else if (typeof(error) === "string") flashWithError(error);
    else {
      errorMap.forEach(x => {
        // message.error(<ul><li>{x.message}</li></ul>);
        flashWithError(x.message);
      });
    }
  }

  if (errors) {
    const errorsMap = new Map(Object.entries(errors));

    errorsMap.forEach(x => {
      // message.error(<ul><li>{x.message}</li></ul>);
      flashWithError(x.message);
    });
  }
};
