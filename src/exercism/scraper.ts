import * as https from "https";
import { Logger } from "../common/logger";
import { Exercise, ExerciseStatus, Solution, Track, TrackStatus } from "../typings/api";

async function request(url: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    https
      .get(url, res => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", chunk => (body += chunk));
        res.on("end", () => resolve(body));
      })
      .on("error", reject);
  });
}

export async function fetchExerciseSolutions(track: Track, exercise: Exercise): Promise<Solution[]> {
  let solutions: Solution[] = [];
  try {
    const data = await request(
      `https://exercism.io/tracks/${track.id}/exercises/${exercise.id}/solutions?utf8=%E2%9C%93&order=num_stars`
    );
    const $ = (await import("cheerio")).load(data);
    $(".solution").each((_, el) => {
      let details: number[] = [];
      const href = $(el).attr("href");
      const uuid = href.substr(href.lastIndexOf("/") + 1);
      $(el)
        .find(".details-bar > .detail")
        .each((i, el) => {
          details[i] = parseInt($(el).text());
        });
      solutions.push({
        author: $(el)
          .find(".details-bar > .handle")
          .text(),
        comments: details[0],
        stars: details[1],
        uuid
      });
    });
  } catch (err) {
    Logger.error("scraper", err);
  }
  return solutions;
}

export async function fetchTrackExercises(trackID: string): Promise<Exercise[]> {
  let exercises: Exercise[] = [];
  try {
    const data = await request("https://exercism.io/tracks/" + trackID + "/exercises");
    const $ = (await import("cheerio")).load(data);
    $(".exercise").each((_, el) => {
      const href = $(el).attr("href");
      const id = href.substr(href.lastIndexOf("/") + 1);
      let topics: string[] = [];
      $(el)
        .find(".details > .topics > .topic")
        .each((_, el) => {
          topics.push($(el).text());
        });
      let difficulty = $(el)
        .find(".stats > .difficulty")
        .text();
      if (difficulty === "easy") {
        difficulty = "★";
      } else if (difficulty === "medium") {
        difficulty = "★★";
      } else {
        difficulty = "★★★";
      }
      exercises.push({
        id,
        name: $(el)
          .find("h3")
          .text(),
        summary: $(el)
          .find(".details > summary")
          .text(),
        difficulty,
        topics,
        status: ExerciseStatus.INACTIVE
      });
    });
  } catch (err) {
    Logger.error("scraper", err);
  }
  return Promise.resolve(exercises);
}

export async function fetchAllTracks(): Promise<Track[]> {
  let tracks: Track[] = [];
  try {
    const data = await request("https://exercism.io/tracks");
    const $ = (await import("cheerio")).load(data);
    $(".track").each((_, el) => {
      const href = $(el).attr("href");
      const id = href.substr(href.lastIndexOf("/") + 1);
      const count = $(el)
        .find(".title > .num-exercises")
        .text();
      const totalExercises = parseInt(count.substr(0, count.indexOf(" ")));
      tracks.push({
        id,
        name: $(el)
          .find(".title > h2")
          .text(),
        totalExercises,
        totalExercisesCompleted: 0,
        status: TrackStatus.INACTIVE,
        summary: $(el)
          .find("summary")
          .text()
      });
    });
  } catch (err) {
    Logger.error("scraper", err);
  }
  return Promise.resolve(tracks);
}
