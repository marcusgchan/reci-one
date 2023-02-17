import flask

app = flask.Flask(__name__)

app.config["DEBUG"] = True

@app.route("/api/test")
def test():
    return "test2"

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000)
