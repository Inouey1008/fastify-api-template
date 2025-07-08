function handler(event) {
  var request = event.request;
  var headers = request.headers;

  // Basic 認証情報
  var username = "swagger-user";
  var password = "W8F!jZFTfM_i";
  var authString = "Basic " + (username + ":" + password).toString("base64");

  // Authorization ヘッダーの確認
  if (headers.authorization && headers.authorization.value === authString) {
    return request;
  }

  // 認証に失敗した場合は 401 エラーを返す
  return {
    statusCode: 401,
    statusDescription: "Unauthorized",
    headers: {
      "www-authenticate": { value: 'Basic realm="Enter your credentials"' },
    },
  };
}
