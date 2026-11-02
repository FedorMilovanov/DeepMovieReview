"""Historical evidence must come from a completed successful VoiceOver job."""
import importlib.util
import pathlib
import unittest

MODULE = pathlib.Path(__file__).resolve().parents[1] / "scripts" / "recover-native-evidence.py"
spec = importlib.util.spec_from_file_location("recover_native_evidence", MODULE)
recovery = importlib.util.module_from_spec(spec)
spec.loader.exec_module(recovery)


class NativeHistorySelectionTest(unittest.TestCase):
    def test_accepts_only_unambiguous_success_for_the_prior_revision(self):
        sha = "a" * 40
        good = {"name": "Actual AT (macos-15)", "head_sha": sha, "status": "completed", "conclusion": "success"}
        self.assertTrue(recovery.is_successful_voiceover([good], sha))
        self.assertFalse(recovery.is_successful_voiceover([], sha))
        self.assertFalse(recovery.is_successful_voiceover([good, good], sha))
        for change in ({"conclusion": "cancelled"}, {"conclusion": "failure"}, {"status": "in_progress"},
                       {"head_sha": "b" * 40}, {"name": "Actual AT (windows-2022)"}):
            self.assertFalse(recovery.is_successful_voiceover([{**good, **change}], sha))


if __name__ == "__main__":
    unittest.main()
