import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { h, isNodeDirective } from "../utils/remark";

const DIRECTIVE_NAME = "github";

function escapeJs(str: string): string {
	return str.replace(/[\\'"/]/g, "\\$&").replace(/<\/script/gi, "<\\/script");
}

function isValidRepoName(name: string): boolean {
	return /^[a-zA-Z0-9_.\-/]+$/.test(name);
}

export const remarkGithubCard: Plugin<[], Root> = () => (tree) => {
	visit(tree, (node, index, parent) => {
		if (!parent || index === undefined || !isNodeDirective(node)) return;

		if (node.type !== "leafDirective" || node.name !== DIRECTIVE_NAME) return;

		let repoName = node.attributes?.repo ?? node.attributes?.user ?? null;
		if (!repoName) return;

		repoName = repoName.endsWith("/") ? repoName.slice(0, -1) : repoName;
		repoName = repoName.startsWith("https://github.com/")
			? repoName.replace("https://github.com/", "")
			: repoName;

		if (!isValidRepoName(repoName)) return;

		const repoParts = repoName.split("/");
		const SimpleUUID = `GC-${crypto.randomUUID()}`;
		const realUrl = `https://github.com/${repoName}`;
		const safeRepoName = escapeJs(repoName);

		if (repoParts.length > 1) {
			const script = h("script", {}, [
				{
					type: "text",
					value: `
				(function(){
					var el=document.getElementById('${SimpleUUID}');
					if(!el)return;
					var ctrl=new AbortController();
					var tid=setTimeout(function(){ctrl.abort()},8000);
					fetch('https://api.github.com/repos/${safeRepoName}',{referrerPolicy:"no-referrer",signal:ctrl.signal})
					.then(function(r){clearTimeout(tid);return r.json()})
					.then(function(data){
						el.classList.remove("gh-loading");
						if(data.message){el.classList.add("gh-error");return}
						var d=el.querySelector('.gh-description');
						if(data.description){d.innerText=data.description.replace(/:[a-zA-Z0-9_]+:/g,'')}else{d.style.display='none'}
						if(data.language)el.querySelector('.gh-language').innerText=data.language;
						el.querySelector('.gh-forks').innerText=Intl.NumberFormat(undefined,{notation:"compact",maximumFractionDigits:1}).format(data.forks).replaceAll("\\u202f",'');
						el.querySelector('.gh-stars').innerText=Intl.NumberFormat(undefined,{notation:"compact",maximumFractionDigits:1}).format(data.stargazers_count).replaceAll("\\u202f",'');
						var av=el.querySelector('.gh-avatar');
						if(data.owner&&data.owner.avatar_url&&/^https:/.test(data.owner.avatar_url)){av.style.backgroundImage='url('+data.owner.avatar_url+')'}
						var lc=el.querySelector('.gh-license');
						if(data.license&&data.license.spdx_id){lc.innerText=data.license.spdx_id}else{lc.style.display='none'}
					})
					.catch(function(e){clearTimeout(tid);el.classList.add("gh-error");console.warn("[GITHUB-CARD] Error:",e)})
				})()`,
				},
			]);

			const hTitle = h("div", { class: "gh-title title" }, [
				h("span", { class: "gh-avatar" }),
				h("a", { class: "gh-text not-prose cactus-link", href: realUrl }, [
					{ type: "text", value: `${repoParts[0]}/${repoParts[1]}` },
				]),
				h("span", { class: "gh-icon" }),
			]);

			const hChips = h("div", { class: "gh-chips" }, [
				h("span", { class: "gh-stars" }, [{ type: "text", value: "00K" }]),
				h("span", { class: "gh-forks" }, [{ type: "text", value: "00K" }]),
				h("span", { class: "gh-license" }, [{ type: "text", value: "MIT" }]),
				h("span", { class: "gh-language" }, [{ type: "text", value: "" }]),
			]);

			const hDescription = h("div", { class: "gh-description" }, [
				{
					type: "text",
					value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
				},
			]);

			parent.children.splice(
				index,
				1,
				h("div", { id: SimpleUUID, class: "github-card gh-loading" }, [
					hTitle,
					hDescription,
					hChips,
					script,
				]),
			);
		} else if (repoParts.length === 1) {
			const script = h("script", {}, [
				{
					type: "text",
					value: `
				(function(){
					var el=document.getElementById('${SimpleUUID}');
					if(!el)return;
					var ctrl=new AbortController();
					var tid=setTimeout(function(){ctrl.abort()},8000);
					fetch('https://api.github.com/users/${safeRepoName}',{referrerPolicy:"no-referrer",signal:ctrl.signal})
					.then(function(r){clearTimeout(tid);return r.json()})
					.then(function(data){
						el.classList.remove("gh-loading");
						if(data.message){el.classList.add("gh-error");return}
						var av=el.querySelector('.gh-avatar');
						if(data.avatar_url&&/^https:/.test(data.avatar_url)){av.style.backgroundImage='url('+data.avatar_url+')'}
						el.querySelector('.gh-followers').innerText=Intl.NumberFormat(undefined,{notation:"compact",maximumFractionDigits:1}).format(data.followers).replaceAll("\\u202f",'');
						el.querySelector('.gh-repositories').innerText=Intl.NumberFormat(undefined,{notation:"compact",maximumFractionDigits:1}).format(data.public_repos).replaceAll("\\u202f",'');
						if(data.location)el.querySelector('.gh-region').innerText=data.location;
					})
					.catch(function(e){clearTimeout(tid);el.classList.add("gh-error");console.warn("[GITHUB-CARD] Error:",e)})
				})()`,
				},
			]);

			parent.children.splice(
				index,
				1,
				h("div", { id: SimpleUUID, class: "github-card gh-simple gh-loading" }, [
					h("div", { class: "gh-title title" }, [
						h("span", { class: "gh-avatar" }),
						h("a", { class: "gh-text not-prose cactus-link", href: realUrl }, [
							{ type: "text", value: repoParts[0] },
						]),
						h("span", { class: "gh-icon" }),
					]),
					h("div", { class: "gh-chips" }, [
						h("span", { class: "gh-followers" }, [{ type: "text", value: "00K" }]),
						h("span", { class: "gh-repositories" }, [{ type: "text", value: "00K" }]),
						h("span", { class: "gh-region" }, [{ type: "text", value: "" }]),
					]),
					script,
				]),
			);
		}
	});
};
