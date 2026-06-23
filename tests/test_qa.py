from unittest.mock import MagicMock, patch

import pytest


def _make_mock_stream(text_chunks: list[str]) -> MagicMock:
    stream = MagicMock()
    stream.__enter__ = MagicMock(return_value=stream)
    stream.__exit__ = MagicMock(return_value=False)
    stream.text_stream = iter(text_chunks)
    return stream


_FAKE_CHUNKS = [
    {
        "text": "def greet(name): return f'Hello, {name}'",
        "metadata": {"file": "src/hello.py", "start_line": 1, "end_line": 3},
        "distance": 0.05,
    }
]


def test_answer_streams_text_to_stdout(capsys) -> None:
    with (
        patch("codebase_qa.qa.embed", return_value=[[0.0] * 384]),
        patch("codebase_qa.qa.query", return_value=_FAKE_CHUNKS),
        patch("codebase_qa.qa.Anthropic") as MockClient,
    ):
        MockClient.return_value.messages.stream.return_value = _make_mock_stream(
            ["The ", "greet ", "function returns a greeting."]
        )

        from codebase_qa.qa import answer
        sources = answer("What does greet do?", top_k=1)

    captured = capsys.readouterr()
    assert "The greet function returns a greeting." in captured.out
    assert len(sources) == 1
    assert sources[0]["file"] == "src/hello.py"
    assert sources[0]["start_line"] == 1


def test_answer_includes_context_in_prompt(capsys) -> None:
    with (
        patch("codebase_qa.qa.embed", return_value=[[0.0] * 384]),
        patch("codebase_qa.qa.query", return_value=_FAKE_CHUNKS),
        patch("codebase_qa.qa.Anthropic") as MockClient,
    ):
        mock_stream = _make_mock_stream(["answer"])
        MockClient.return_value.messages.stream.return_value = mock_stream

        from codebase_qa.qa import answer
        answer("What does greet do?", top_k=1)

    call_kwargs = MockClient.return_value.messages.stream.call_args.kwargs
    user_content = call_kwargs["messages"][0]["content"]
    assert "src/hello.py:1-3" in user_content
    assert "def greet" in user_content


def test_answer_returns_empty_when_no_chunks(capsys) -> None:
    with (
        patch("codebase_qa.qa.embed", return_value=[[0.0] * 384]),
        patch("codebase_qa.qa.query", return_value=[]),
    ):
        from codebase_qa.qa import answer
        sources = answer("anything?")

    assert sources == []
    assert "No indexed chunks" in capsys.readouterr().out


def test_mock_skips_api_and_returns_sources(capsys) -> None:
    with (
        patch("codebase_qa.qa.embed", return_value=[[0.0] * 384]),
        patch("codebase_qa.qa.query", return_value=_FAKE_CHUNKS),
        patch("codebase_qa.qa.Anthropic") as MockClient,
    ):
        from codebase_qa.qa import answer
        sources = answer("What does greet do?", top_k=1, mock=True)

    MockClient.assert_not_called()
    captured = capsys.readouterr()
    assert "[MOCK]" in captured.out
    assert len(sources) == 1
    assert sources[0]["file"] == "src/hello.py"


def test_mock_no_chunks_returns_empty(capsys) -> None:
    with (
        patch("codebase_qa.qa.embed", return_value=[[0.0] * 384]),
        patch("codebase_qa.qa.query", return_value=[]),
    ):
        from codebase_qa.qa import answer
        sources = answer("anything?", mock=True)

    assert sources == []
    assert "No indexed chunks" in capsys.readouterr().out
